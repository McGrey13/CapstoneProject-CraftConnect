<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoreController extends Controller
{
    public function me(Request $request)
    {
        $user = Auth::user();
        $store = Store::where('user_id', $user->userID)->latest()->first();
        return response()->json($store);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'bir' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255',
            'owner_phone' => 'nullable|string|max:50',
            'owner_address' => 'nullable|string',
        ]);

        $seller = Seller::where('user_id', $user->userID)->firstOrFail();

        $logoPath = null;
        $birPath = null;

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('bir')) {
            $birPath = $request->file('bir')->store('stores/bir', 'public');
        }

        $store = Store::create([
            'seller_id' => $seller->sellerID,
            'user_id' => $user->userID,
            'store_name' => $validated['store_name'],
            'store_description' => $validated['store_description'] ?? null,
            'category' => $validated['category'] ?? null,
            'logo_path' => $logoPath,
            'bir_path' => $birPath,
            'owner_name' => $validated['owner_name'],
            'owner_email' => $validated['owner_email'],
            'owner_phone' => $validated['owner_phone'] ?? null,
            'owner_address' => $validated['owner_address'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($store, 201);
    }

    public function approve(Store $store)
    {
        $store->update(['status' => 'approved']);
        return response()->json(['message' => 'Store approved']);
    }

    public function reject(Store $store)
    {
        $store->update(['status' => 'rejected']);
        return response()->json(['message' => 'Store rejected']);
    }
}


