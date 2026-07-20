<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class StoreSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'setting' => StoreSetting::first(),
        ]);
    }

    public function update(Request $request)
    {
        $setting = StoreSetting::first();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($setting->logo && Storage::disk('public')->exists($setting->logo)) {
                Storage::disk('public')->delete($setting->logo);
            }
            $validated['logo'] = $request->file('logo')->store('store', 'public');
        } else {
            // Unset logo to prevent nulling it if not uploaded
            unset($validated['logo']);
        }

        $setting->update($validated);

        // Clear global cache so HandleInertiaRequests gets the updated data
        Cache::forget('store_setting');

        return back()->with('success', 'Store settings updated successfully.');
    }
}
