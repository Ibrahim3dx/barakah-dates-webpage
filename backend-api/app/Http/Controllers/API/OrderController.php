<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
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
            'delivery_price' => 'nullable|numeric|min:0',
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
                'delivery_price' => $validated['delivery_price'] ?? 0,
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
                'total_amount' => $totalAmount + ($validated['delivery_price'] ?? 0)
            ]);

            DB::commit();

            // Send email notification to orders team
            $this->sendOrderNotificationEmail($order);

            // Send confirmation email to customer
            $this->sendCustomerOrderConfirmation($order);

            $response = $order->load('items.product');

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
            'delivery_price' => 'nullable|numeric|min:0',
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
     * Send order notification email to orders team
     */
    private function sendOrderNotificationEmail(Order $order)
    {
        try {
            $subject = 'طلب جديد - New Order #' . $order->id . ' | البركة للتمور';
            $ordersEmail = config('services.orders.email', 'ibrahim3dx@gmail.com');

            $order->load(['items.product']);

            // Prepare data for the email template
            $paymentMethod = match($order->payment_method) {
                'cash' => 'نقداً عند التسليم - Cash on Delivery',
                'massarat' => 'مسارات - Massarat Bank Transfer',
                'paypal' => 'باي بال - PayPal',
                default => $order->payment_method
            };

            $orderStatus = match($order->order_status) {
                'pending' => 'في الانتظار - Pending',
                'processing' => 'قيد المعالجة - Processing',
                'completed' => 'مكتمل - Completed',
                'cancelled' => 'ملغي - Cancelled',
                default => $order->order_status
            };

            Mail::send('mail.order-notification', [
                'order' => $order,
                'paymentMethod' => $paymentMethod,
                'orderStatus' => $orderStatus
            ], function ($message) use ($subject, $ordersEmail) {
                $message->to($ordersEmail)
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
     * Send order confirmation email to customer
     */
    private function sendCustomerOrderConfirmation(Order $order)
    {
        try {
            $subject = 'تأكيد طلبك - Order Confirmation #' . $order->id . ' | البركة للتمور';

            $order->load(['items.product']);

            // Prepare data for the email template
            $paymentMethod = match($order->payment_method) {
                'cash' => 'نقداً عند التسليم - Cash on Delivery',
                // 'massarat' => 'مسارات - Massarat Bank Transfer',
                // 'paypal' => 'باي بال - PayPal',
                default => $order->payment_method
            };

            Mail::send('mail.customer-order-confirmation', [
                'order' => $order,
                'paymentMethod' => $paymentMethod
            ], function ($message) use ($subject, $order) {
                $message->to($order->customer_email, $order->customer_name)
                       ->subject($subject)
                       ->from(config('mail.from.address'), config('mail.from.name'));
            });

            Log::info('Customer order confirmation email sent', [
                'order_id' => $order->id,
                'customer_email' => $order->customer_email
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send customer order confirmation email', [
                'order_id' => $order->id,
                'customer_email' => $order->customer_email,
                'error' => $e->getMessage()
            ]);
        }
    }
}
