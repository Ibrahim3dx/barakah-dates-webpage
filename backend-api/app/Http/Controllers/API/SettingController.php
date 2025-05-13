<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $group = $request->get('group', 'general');
        $settings = Setting::where('group', $group)->get();

        return response()->json($settings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.group' => 'required|string',
            'settings.*.description' => 'nullable|string'
        ]);

        foreach ($validated['settings'] as $setting) {
            Setting::set(
                $setting['key'],
                $setting['value'],
                $setting['group'],
                $setting['description'] ?? null
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => Setting::whereIn('key', collect($validated['settings'])->pluck('key'))->get()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function getWhatsAppNumber()
    {
        return response()->json([
            'whatsapp_number' => Setting::get('whatsapp_number')
        ]);
    }

    public function updateWhatsAppNumber(Request $request)
    {
        $validated = $request->validate([
            'whatsapp_number' => 'required|string'
        ]);

        Setting::set(
            'whatsapp_number',
            $validated['whatsapp_number'],
            'integrations',
            'WhatsApp number for order notifications'
        );

        return response()->json([
            'message' => 'WhatsApp number updated successfully',
            'whatsapp_number' => $validated['whatsapp_number']
        ]);
    }
}
