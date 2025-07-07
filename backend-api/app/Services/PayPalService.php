<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayPalService
{
    private string $clientId;
    private string $clientSecret;
    private string $apiUrl;
    private string $mode;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id') ?? '';
        $this->clientSecret = config('services.paypal.client_secret') ?? '';
        $this->mode = config('services.paypal.mode', 'sandbox');
        $this->apiUrl = $this->mode === 'live'
            ? 'https://api.paypal.com'
            : 'https://api.sandbox.paypal.com';
    }

    public function createOrder(Order $order): array
    {
        try {
            $accessToken = $this->getAccessToken();

            if (!$accessToken) {
                return ['success' => false, 'message' => 'Failed to get PayPal access token'];
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json',
                'PayPal-Request-Id' => uniqid(), // Unique request ID
            ])->post("{$this->apiUrl}/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'amount' => [
                            'currency_code' => 'USD',
                            'value' => number_format($order->total_amount, 2, '.', '')
                        ],
                        'description' => "Order #{$order->id}",
                        'invoice_id' => (string) $order->id,
                    ]
                ],
                'application_context' => [
                    'brand_name' => config('app.name', 'Barakah Dates'),
                    'landing_page' => 'BILLING',
                    'user_action' => 'PAY_NOW',
                    'return_url' => url('/api/payments/paypal/callback'),
                    'cancel_url' => url('/checkout'),
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'order_id' => $data['id'],
                    'approval_url' => collect($data['links'])->firstWhere('rel', 'approve')['href'] ?? null
                ];
            }

            Log::error('PayPal order creation failed', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create PayPal order',
                'error' => $response->json()
            ];

        } catch (\Exception $e) {
            Log::error('PayPal order creation exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'PayPal service error: ' . $e->getMessage()
            ];
        }
    }

    public function capturePayment(string $orderId): array
    {
        try {
            $accessToken = $this->getAccessToken();

            if (!$accessToken) {
                return ['success' => false, 'message' => 'Failed to get PayPal access token'];
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/v2/checkout/orders/{$orderId}/capture");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'transaction_id' => $data['purchase_units'][0]['payments']['captures'][0]['id'] ?? null,
                    'status' => $data['status'],
                    'data' => $data
                ];
            }

            Log::error('PayPal payment capture failed', [
                'order_id' => $orderId,
                'response' => $response->json(),
                'status' => $response->status()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to capture PayPal payment',
                'error' => $response->json()
            ];

        } catch (\Exception $e) {
            Log::error('PayPal payment capture exception', [
                'order_id' => $orderId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'PayPal service error: ' . $e->getMessage()
            ];
        }
    }

    private function getAccessToken(): ?string
    {
        try {
            if (empty($this->clientId) || empty($this->clientSecret)) {
                Log::error('PayPal credentials not configured');
                return null;
            }

            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->post("{$this->apiUrl}/v1/oauth2/token", [
                    'grant_type' => 'client_credentials'
                ]);

            if ($response->successful()) {
                return $response->json()['access_token'];
            }

            Log::error('Failed to get PayPal access token', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('PayPal access token exception', [
                'message' => $e->getMessage()
            ]);

            return null;
        }
    }
}
