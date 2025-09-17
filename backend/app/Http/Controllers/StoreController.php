<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use app\models\User;

class StoreController extends Controller
{
    public function me(Request $request)
    {
        $user = Auth::user();
        $store = Store::where('user_id', $user->userID)
            ->with('seller')
            ->latest()
            ->first();
            
        if (!$store) {
            return response()->json(['message' => 'No store found'], 404);
        }
        
        return response()->json([
            'store' => $store,
            'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
            'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
        ]);
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

    public function update(Request $request, Store $store)
    {
        $user = Auth::user();
        
        // Check if user owns this store
        if ($store->user_id !== $user->userID && $user->role !== 'administrator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'store_name' => 'sometimes|string|max:255',
            'store_description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'bir' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:8192',
            'owner_name' => 'sometimes|string|max:255',
            'owner_email' => 'sometimes|email|max:255',
            'owner_phone' => 'nullable|string|max:50',
            'owner_address' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($store->logo_path) {
                Storage::disk('public')->delete($store->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('stores/logos', 'public');
        }

        if ($request->hasFile('bir')) {
            // Delete old BIR document if exists
            if ($store->bir_path) {
                Storage::disk('public')->delete($store->bir_path);
            }
            $validated['bir_path'] = $request->file('bir')->store('stores/bir', 'public');
        }

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'store' => $store,
            'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
            'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
        ]);
    }

    public function show(Store $store)
    {
        return response()->json([
            'store' => $store->load('seller', 'user'),
            'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
            'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
        ]);
    }

    public function index(Request $request)
    {
        $query = Store::with('seller', 'user');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category if provided
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search by store name
        if ($request->has('search')) {
            $query->where('store_name', 'like', '%' . $request->search . '%');
        }

        $stores = $query->latest()->paginate(10);

        // Add full URLs for images
        $stores->getCollection()->transform(function ($store) {
            $store->logo_url = $store->logo_path ? url('storage/' . $store->logo_path) : null;
            $store->bir_url = $store->bir_path ? url('storage/' . $store->bir_path) : null;
            return $store;
        });

        return response()->json($stores);
    }

    public function destroy(Store $store)
    {
        $user = Auth::user();
        
        // Check if user owns this store or is an admin
        if ($store->user_id !== $user->userID && $user->role !== 'administrator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete store files
        if ($store->logo_path) {
            Storage::disk('public')->delete($store->logo_path);
        }
        if ($store->bir_path) {
            Storage::disk('public')->delete($store->bir_path);
        }

        $store->delete();

        return response()->json(['message' => 'Store deleted successfully']);
    }
}