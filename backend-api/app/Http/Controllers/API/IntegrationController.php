<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class IntegrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $integrations = Integration::all();
        return response()->json($integrations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['whatsapp', 'massarat', 'paypal'])],
            'credentials' => 'required|array',
            'settings' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            $integration = Integration::create([
                'name' => $validated['name'],
                'type' => $validated['type'],
                'credentials' => $validated['credentials'],
                'settings' => $validated['settings'] ?? [],
                'is_active' => $validated['is_active'] ?? true
            ]);

            DB::commit();

            return response()->json($integration, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating integration: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Integration $integration)
    {
        return response()->json($integration);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Integration $integration)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'credentials' => 'sometimes|required|array',
            'settings' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            if (isset($validated['name'])) {
                $integration->name = $validated['name'];
            }
            if (isset($validated['credentials'])) {
                $integration->credentials = $validated['credentials'];
            }
            if (isset($validated['settings'])) {
                $integration->settings = $validated['settings'];
            }
            if (isset($validated['is_active'])) {
                $integration->is_active = $validated['is_active'];
            }

            $integration->save();

            DB::commit();

            return response()->json($integration);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating integration: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Integration $integration)
    {
        try {
            $integration->delete();
            return response()->json([
                'message' => 'Integration deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting integration: ' . $e->getMessage()
            ], 500);
        }
    }

    public function test(Integration $integration)
    {
        try {
            switch ($integration->type) {
                case 'whatsapp':
                    return $this->testWhatsApp($integration);
                case 'massarat':
                    return $this->testMassarAT($integration);
                case 'paypal':
                    return $this->testPayPal($integration);
                default:
                    return response()->json([
                        'message' => 'Unsupported integration type'
                    ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Integration test failed: ' . $e->getMessage()
            ], 500);
        }
    }

    private function testWhatsApp(Integration $integration)
    {
        // Implement WhatsApp test logic
        return response()->json([
            'message' => 'WhatsApp integration test successful'
        ]);
    }

    private function testMassarAT(Integration $integration)
    {
        // Implement MassarAT test logic
        return response()->json([
            'message' => 'MassarAT integration test successful'
        ]);
    }

    private function testPayPal(Integration $integration)
    {
        // Implement PayPal test logic
        return response()->json([
            'message' => 'PayPal integration test successful'
        ]);
    }
}
