<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    private string $apiUrl;
    private string $apiKey;
    private string $phoneNumber;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url');
        $this->apiKey = config('services.whatsapp.api_key');
        $this->phoneNumber = Setting::get('whatsapp_number');
    }

    public function sendOrderNotification(Order $order): bool
    {
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

    private function formatOrderMessage(Order $order): string
    {
        $items = $order->items->map(function ($item) {
            return "{$item->quantity}x {$item->product->name} - {$item->total_price}";
        })->join("\n");

        return "New Order #{$order->id}\n\n" .
               "Customer: {$order->customer_name}\n" .
               "Phone: {$order->customer_phone}\n" .
               "Email: {$order->customer_email}\n" .
               "Address: {$order->shipping_address}\n\n" .
               "Items:\n{$items}\n\n" .
               "Total Amount: {$order->total_amount}\n" .
               "Payment Method: {$order->payment_method}\n" .
               "Order Status: {$order->order_status}";
    }
}
