<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\WhatsAppService;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    private WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['items.product']);

        // If user_id is provided, filter orders for that specific user
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Apply search filter if provided
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Apply status filter if provided and valid
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        // Apply date filters if provided
        if ($request->has('from') && $request->from) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->has('to') && $request->to) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        // Order by created_at in descending order (latest first)
        $query->orderBy('created_at', 'desc');

        // Paginate the results
        $orders = $query->paginate(10);

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'shipping_address' => 'required|string',
            'payment_method' => ['required', Rule::in(['cash', 'massarat', 'paypal'])],
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        try {
            DB::beginTransaction();

            $order = Order::create([
                'user_id' => $validated['user_id'] ?? ($request->user() ? $request->user()->id : null),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'total_amount' => 0,
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'is_wholesale' => false
            ]);

            $isWholesale = false;
            $totalAmount = 0;

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $isItemWholesale = $product->isWholesale($item['quantity']);
                $unitPrice = $product->getPriceForQuantity($item['quantity']);

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'is_wholesale' => $isItemWholesale
                ]);

                // Update product stock
                $product->decrement('stock', $item['quantity']);

                $isWholesale = $isWholesale || $isItemWholesale;
                $totalAmount += $unitPrice * $item['quantity'];
            }

            $order->update([
                'is_wholesale' => $isWholesale,
                'total_amount' => $totalAmount
            ]);

            DB::commit();

            // Send WhatsApp notification or get WhatsApp URL
            $whatsappResult = $this->whatsAppService->sendOrderNotification($order);

            // Send email notification to sales team
            $this->sendOrderNotificationEmail($order);

            $response = $order->load('items.product');

            // If WhatsApp service is disabled, include the WhatsApp URL in response
            if (is_string($whatsappResult)) {
                $response->whatsapp_url = $whatsappResult;
            }

            return response()->json($response, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['items.product', 'user']);
        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'shipping_address' => 'required|string',
            'order_status' => ['required', Rule::in(['pending', 'processing', 'completed', 'cancelled'])],
            'payment_status' => ['required', Rule::in(['pending', 'paid', 'failed'])],
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);

        return response()->json($order->load(['items.product', 'user']));
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => ['required', Rule::in(['pending', 'processing', 'completed', 'cancelled'])],
        ]);

        $order->update($validated);

        return response()->json($order);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    /**
     * Send order notification email to sales team
     */
    private function sendOrderNotificationEmail(Order $order)
    {
        try {
            $subject = 'طلب جديد - New Order #' . $order->id . ' | البركة للتمور';
            $emailContent = $this->formatOrderNotificationEmail($order);

            Mail::raw($emailContent, function ($message) use ($subject) {
                $message->to('sales@albarakadates.com')
                       ->subject($subject)
                       ->from(config('mail.from.address'), config('mail.from.name'));
            });

            Log::info('Order notification email sent', ['order_id' => $order->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send order notification email', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Format order notification email content in Arabic
     */
    private function formatOrderNotificationEmail(Order $order): string
    {
        $order->load(['items.product']);

        $paymentMethodArabic = match($order->payment_method) {
            'cash' => 'نقداً عند التسليم',
            'massarat' => 'مسارات (تحويل بنكي)',
            'paypal' => 'باي بال',
            default => $order->payment_method
        };

        $statusArabic = match($order->order_status) {
            'pending' => 'في الانتظار',
            'processing' => 'قيد المعالجة',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي',
            default => $order->order_status
        };

        $paymentStatusArabic = match($order->payment_status) {
            'pending' => 'في الانتظار',
            'paid' => 'مدفوع',
            'failed' => 'فشل',
            default => $order->payment_status
        };

        $content = "=== طلب جديد من البركة للتمور ===\n\n";
        $content .= "رقم الطلب: #{$order->id}\n";
        $content .= "تاريخ الطلب: " . $order->created_at->format('Y-m-d H:i:s') . "\n\n";

        $content .= "=== بيانات العميل ===\n";
        $content .= "الاسم: {$order->customer_name}\n";
        $content .= "البريد الإلكتروني: {$order->customer_email}\n";
        $content .= "رقم الهاتف: {$order->customer_phone}\n";
        $content .= "عنوان التسليم: {$order->shipping_address}\n\n";

        $content .= "=== تفاصيل الطلب ===\n";
        foreach ($order->items as $item) {
            $content .= "• {$item->product->name}\n";
            $content .= "  الكمية: {$item->quantity}\n";
            $content .= "  السعر للوحدة: {$item->unit_price} ريال\n";
            $content .= "  المجموع: " . ($item->quantity * $item->unit_price) . " ريال\n";
            if ($item->is_wholesale) {
                $content .= "  (سعر الجملة)\n";
            }
            $content .= "\n";
        }

        $content .= "=== ملخص الطلب ===\n";
        $content .= "المبلغ الإجمالي: {$order->total_amount} ريال سعودي\n";
        $content .= "طريقة الدفع: {$paymentMethodArabic}\n";
        $content .= "حالة الطلب: {$statusArabic}\n";
        $content .= "حالة الدفع: {$paymentStatusArabic}\n";

        if ($order->is_wholesale) {
            $content .= "نوع الطلب: طلب جملة\n";
        }

        if ($order->notes) {
            $content .= "\n=== ملاحظات العميل ===\n";
            $content .= $order->notes . "\n";
        }

        $content .= "\n---\n";
        $content .= "يرجى معالجة هذا الطلب في أقرب وقت ممكن.\n";
        $content .= "للاطلاع على تفاصيل أكثر، يرجى تسجيل الدخول إلى لوحة التحكم.\n\n";
        $content .= "فريق البركة للتمور ومنتجات النخيل\n";
        $content .= "تم إنشاء هذا البريد تلقائياً من نظام إدارة الطلبات.";

        return $content;
    }
}
