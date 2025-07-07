<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MassarATService
{
    private string $apiUrl;
    private string $apiKey;
    private string $merchantId;

    public function __construct()
    {
        $this->apiUrl = config('services.massarat.api_url') ?? '';
        $this->apiKey = config('services.massarat.api_key') ?? '';
        $this->merchantId = config('services.massarat.merchant_id') ?? '';
    }

    public function createPayment(Order $order): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json'
            ])->post("{$this->apiUrl}/payments", [
                'merchant_id' => $this->merchantId,
                'amount' => $order->total_amount,
                'currency' => 'LYD',
                'order_id' => $order->id,
                'customer' => [
                    'name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone
                ],
                'callback_url' => route('api.payments.massarat.callback'),
                'return_url' => config('app.frontend_url') . '/orders/' . $order->id
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'payment_url' => $data['payment_url'],
                    'transaction_id' => $data['transaction_id']
                ];
            }

            Log::error('MassarAT payment creation failed', [
                'order_id' => $order->id,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create payment'
            ];

        } catch (\Exception $e) {
            Log::error('MassarAT payment error', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Payment service error'
            ];
        }
    }

    public function verifyPayment(string $transactionId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json'
            ])->get("{$this->apiUrl}/payments/{$transactionId}");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'status' => $data['status'],
                    'amount' => $data['amount'],
                    'order_id' => $data['order_id']
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to verify payment'
            ];

        } catch (\Exception $e) {
            Log::error('MassarAT payment verification error', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Payment verification error'
            ];
        }
    }
}
