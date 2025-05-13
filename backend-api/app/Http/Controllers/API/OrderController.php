<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\WhatsAppService;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Validation\Rule;

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
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
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
                'user_id' => $request->user()->id,
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

            // Send WhatsApp notification
            $this->whatsAppService->sendOrderNotification($order);

            return response()->json($order->load('items.product'), 201);

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
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
