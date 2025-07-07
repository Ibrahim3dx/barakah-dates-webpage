<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MassarATService;
use App\Services\PayPalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    private MassarATService $massarATService;
    private PayPalService $payPalService;

    public function __construct(
        MassarATService $massarATService,
        PayPalService $payPalService
    ) {
        $this->massarATService = $massarATService;
        $this->payPalService = $payPalService;
    }

    public function initiatePayment(Request $request, Order $order)
    {
        if ($order->payment_status === 'paid') {
            return response()->json([
                'message' => 'Order is already paid'
            ], 400);
        }

        switch ($order->payment_method) {
            case 'massarat':
                return $this->initiateMassarATPayment($order);
            case 'paypal':
                return $this->initiatePayPalPayment($order);
            default:
                return response()->json([
                    'message' => 'Invalid payment method'
                ], 400);
        }
    }

    private function initiateMassarATPayment(Order $order)
    {
        $result = $this->massarATService->createPayment($order);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 500);
        }

        $order->update([
            'transaction_id' => $result['transaction_id']
        ]);

        return response()->json([
            'payment_url' => $result['payment_url']
        ]);
    }

    private function initiatePayPalPayment(Order $order)
    {
        $result = $this->payPalService->createOrder($order);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 500);
        }

        $order->update([
            'transaction_id' => $result['order_id']
        ]);

        return response()->json([
            'order_id' => $result['order_id'],
            'links' => $result['links']
        ]);
    }

    public function handleMassarATCallback(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|string',
            'status' => 'required|string',
            'order_id' => 'required|exists:orders,id'
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($order->transaction_id !== $validated['transaction_id']) {
            return response()->json([
                'message' => 'Invalid transaction'
            ], 400);
        }

        try {
            DB::beginTransaction();

            if ($validated['status'] === 'success') {
                $order->update([
                    'payment_status' => 'paid',
                    'order_status' => 'processing'
                ]);
            } else {
                $order->update([
                    'payment_status' => 'failed'
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment status updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating payment status'
            ], 500);
        }
    }

    public function handlePayPalCallback(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'paypal_order_id' => 'required|string'
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($order->transaction_id !== $validated['paypal_order_id']) {
            return response()->json([
                'message' => 'Invalid PayPal order'
            ], 400);
        }

        $result = $this->payPalService->capturePayment($validated['paypal_order_id']);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 500);
        }

        try {
            DB::beginTransaction();

            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'processing',
                'transaction_id' => $result['transaction_id']
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Payment captured successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating payment status'
            ], 500);
        }
    }

    public function verifyPayment(Request $request, Order $order)
    {
        if (!$order->transaction_id) {
            return response()->json([
                'message' => 'No transaction found for this order'
            ], 400);
        }

        switch ($order->payment_method) {
            case 'massarat':
                $result = $this->massarATService->verifyPayment($order->transaction_id);
                break;
            case 'paypal':
                $result = $this->payPalService->capturePayment($order->transaction_id);
                break;
            default:
                return response()->json([
                    'message' => 'Invalid payment method'
                ], 400);
        }

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message']
            ], 500);
        }

        return response()->json([
            'status' => $result['status'],
            'transaction_id' => $result['transaction_id'] ?? null
        ]);
    }
}
