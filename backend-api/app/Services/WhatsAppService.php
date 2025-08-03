<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class WhatsAppService
{
    private string $apiUrl;
    private string $apiKey;
    private string $phoneNumber;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url') ?? '';
        $this->apiKey = config('services.whatsapp.api_key') ?? '';
        $this->phoneNumber = Setting::get('whatsapp_number') ?? '';
    }

    public function sendOrderNotification(Order $order): bool|string
    {
        // Send email notification to sales team
        $this->sendSalesEmail($order);

        // Check if WhatsApp service is enabled
        if (!config('services.whatsapp.enabled', false)) {
            // Return WhatsApp URL for manual message sending
            return $this->generateWhatsAppUrl($order);
        }

        if (!$this->phoneNumber) {
            return false;
        }

        $message = $this->formatOrderMessage($order);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json'
            ])->post("{$this->apiUrl}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $this->phoneNumber,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            report($e);
            return false;
        }
    }

    private function sendSalesEmail(Order $order): void
    {
        try {
            $salesEmail = 'sales@albarakadates.com';
            $subject = "طلبية جديدة #{$order->id} - New Order #{$order->id}";

            // Format order details for email
            $orderDetails = $this->formatOrderForEmail($order);

            Mail::raw($orderDetails, function ($message) use ($salesEmail, $subject) {
                $message->to($salesEmail)
                       ->subject($subject)
                       ->from(config('mail.from.address'), config('mail.from.name'));
            });

        } catch (\Exception $e) {
            // Log error but don't fail the order creation
            report($e);
        }
    }

    private function formatOrderForEmail(Order $order): string
    {
        $items = $order->items->map(function ($item) {
            return "• {$item->quantity}x {$item->product->name} - {$item->total_price} د.ل";
        })->join("\n");

        return "=== طلبية جديدة / NEW ORDER ===\n\n" .
               "رقم الطلبية / Order ID: #{$order->id}\n" .
               "تاريخ الطلب / Order Date: " . $order->created_at->format('Y-m-d H:i:s') . "\n\n" .
               "=== تفاصيل العميل / Customer Details ===\n" .
               "الاسم / Name: {$order->customer_name}\n" .
               "الهاتف / Phone: {$order->customer_phone}\n" .
               "البريد الإلكتروني / Email: {$order->customer_email}\n" .
               "العنوان / Address: {$order->shipping_address}\n\n" .
               "=== المنتجات / Products ===\n{$items}\n\n" .
               "=== معلومات الطلب / Order Information ===\n" .
               "المبلغ الإجمالي / Total Amount: {$order->total_amount} د.ل\n" .
               "طريقة الدفع / Payment Method: " . $this->translatePaymentMethod($order->payment_method) . " / {$order->payment_method}\n" .
               "حالة الطلبية / Order Status: " . $this->translateOrderStatus($order->order_status) . " / {$order->order_status}\n" .
               "نوع الطلب / Order Type: " . ($order->is_wholesale ? 'جملة / Wholesale' : 'تجزئة / Retail') . "\n\n" .
               "=== ملاحظات / Notes ===\n" .
               ($order->notes ? $order->notes : 'لا توجد ملاحظات / No notes') . "\n\n" .
               "---\n" .
               "تم إنشاء هذا البريد تلقائياً من نظام البركة للتمور\n" .
               "This email was generated automatically from Al Baraka Dates system";
    }

    private function formatOrderMessage(Order $order): string
    {
        $items = $order->items->map(function ($item) {
            return "{$item->quantity}x {$item->product->name} - {$item->total_price} د.ل";
        })->join("\n");

        return "طلبية جديدة #{$order->id}\n\n" .
               "العميل: {$order->customer_name}\n" .
               "الهاتف: {$order->customer_phone}\n" .
               "البريد الإلكتروني: {$order->customer_email}\n" .
               "العنوان: {$order->shipping_address}\n\n" .
               "المنتجات:\n{$items}\n\n" .
               "المبلغ الإجمالي: {$order->total_amount} د.ل\n" .
               "طريقة الدفع: " . $this->translatePaymentMethod($order->payment_method) . "\n" .
               "حالة الطلبية: " . $this->translateOrderStatus($order->order_status);
    }

    private function generateWhatsAppUrl(Order $order): string
    {
        $receiverNumber = config('services.whatsapp.receiver_number');
        $message = $this->formatOrderMessage($order);

        // Encode the message for URL
        $encodedMessage = urlencode($message);

        // Generate WhatsApp URL
        return "https://wa.me/{$receiverNumber}?text={$encodedMessage}";
    }

    private function translatePaymentMethod(string $paymentMethod): string
    {
        $translations = [
            'massarat' => 'مصرات',
            'paypal' => 'باي بال',
            'cash_on_delivery' => 'الدفع عند الاستلام',
            'bank_transfer' => 'تحويل بنكي',
            'card' => 'بطاقة ائتمانية'
        ];

        return $translations[$paymentMethod] ?? $paymentMethod;
    }

    private function translateOrderStatus(string $orderStatus): string
    {
        $translations = [
            'pending' => 'في الانتظار',
            'processing' => 'قيد المعالجة',
            'shipped' => 'تم الشحن',
            'delivered' => 'تم التسليم',
            'completed' => 'مكتملة',
            'cancelled' => 'ملغية'
        ];

        return $translations[$orderStatus] ?? $orderStatus;
    }
}
