<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use app\models\User;

class StoreController extends Controller
{
    public function me(Request $request)
    {
        $user = Auth::user();
        
        Log::info('StoreController@me called', [
            'user_id' => $user ? $user->userID : 'No user',
            'user_role' => $user ? $user->role : 'No role'
        ]);
        
        if (!$user) {
            Log::warning('No authenticated user found');
            return response()->json(['message' => 'User not authenticated'], 401);
        }
        
        $store = Store::where('user_id', $user->userID)
            ->with('seller')
            ->latest()
            ->first();
            
        Log::info('Store query result', [
            'store_found' => $store ? 'Yes' : 'No',
            'store_id' => $store ? $store->storeID : null,
            'store_name' => $store ? $store->store_name : null,
            'logo_path' => $store ? $store->logo_path : null
        ]);
            
        if (!$store) {
            return response()->json(['message' => 'No store found'], 404);
        }
        
        $response = [
            'store' => $store,
            'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
            'background_url' => $store->background_image_path ? url('storage/' . $store->background_image_path) : null,
            'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
        ];
        
        Log::info('Store data response', $response);
        
        return response()->json($response);
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
        Log::info('StoreController@index called', [
            'request_data' => $request->all(),
            'user_authenticated' => Auth::check(),
            'user_id' => Auth::id()
        ]);

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

        Log::info('Stores query result', [
            'stores_count' => $stores->count(),
            'total' => $stores->total()
        ]);

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

    public function getStoreBySeller($sellerId)
    {
        try {
            Log::info('StoreController@getStoreBySeller called', [
                'seller_id' => $sellerId
            ]);
            
            // Find the seller with user relationship and products for rating calculation
            $seller = Seller::with(['user', 'followers', 'products'])
                ->where('sellerID', $sellerId)
                ->first();
            
            if (!$seller) {
                Log::warning('Seller not found', ['seller_id' => $sellerId]);
                return response()->json(['message' => 'Seller not found'], 404);
            }
            
            // Find the store for this seller's user
            $store = Store::where('user_id', $seller->user_id)
                ->with('seller')
                ->latest()
                ->first();
                
            Log::info('Store query result for seller', [
                'seller_id' => $sellerId,
                'user_id' => $seller->user_id,
                'store_found' => $store ? 'Yes' : 'No',
                'store_id' => $store ? $store->storeID : null,
                'store_name' => $store ? $store->store_name : null
            ]);
                
            if (!$store) {
                Log::warning('No store found for seller', ['seller_id' => $sellerId, 'user_id' => $seller->user_id]);
                return response()->json(['message' => 'No store found for this seller'], 404);
            }
            
            // Calculate average rating from products
            $averageRating = 0;
            $totalRatings = 0;
            
            if ($seller->products) {
                $totalRatingSum = 0;
                $ratingCount = 0;
                
                foreach ($seller->products as $product) {
                    $productRatings = \App\Models\Ratings::where('product_id', $product->product_id)->get();
                    foreach ($productRatings as $rating) {
                        $totalRatingSum += $rating->stars;
                        $ratingCount++;
                    }
                }
                
                if ($ratingCount > 0) {
                    $averageRating = round($totalRatingSum / $ratingCount, 1);
                    $totalRatings = $ratingCount;
                }
            }
            
            // Get followers count (handle potential column name issues)
            try {
                $followersCount = $seller->followers()->count();
            } catch (\Exception $e) {
                Log::warning('Error getting followers count, using 0', ['error' => $e->getMessage()]);
                $followersCount = 0;
            }
            
            // Prepare location string from city and province
            $location = '';
            if ($seller->user) {
                $locationParts = [];
                if ($seller->user->userCity) {
                    $locationParts[] = $seller->user->userCity;
                }
                if ($seller->user->userProvince) {
                    $locationParts[] = $seller->user->userProvince;
                }
                $location = implode(', ', $locationParts);
            }
            
            $response = [
                'store' => $store,
                'seller' => [
                    'sellerID' => $seller->sellerID,
                    'average_rating' => $averageRating,
                    'total_ratings' => $totalRatings,
                    'followers_count' => $followersCount,
                    'user' => [
                        'userID' => $seller->user ? $seller->user->userID : null,
                        'userName' => $seller->user ? $seller->user->userName : null,
                        'userEmail' => $seller->user ? $seller->user->userEmail : null,
                        'userAddress' => $location ?: ($seller->user ? $seller->user->userAddress : null),
                        'userCity' => $seller->user ? $seller->user->userCity : null,
                        'userProvince' => $seller->user ? $seller->user->userProvince : null,
                        'userRegion' => $seller->user ? $seller->user->userRegion : null,
                    ]
                ],
                'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
                'background_url' => $store->background_image_path ? url('storage/' . $store->background_image_path) : null,
                'bir_url' => $store->bir_path ? url('storage/' . $store->bir_path) : null,
            ];
            
            Log::info('Store data response for seller', [
                'store_id' => $store->storeID,
                'store_name' => $store->store_name,
                'store_description' => $store->store_description,
                'average_rating' => $averageRating,
                'total_ratings' => $totalRatings,
                'followers_count' => $followersCount,
                'location' => $location
            ]);
            
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error in getStoreBySeller', [
                'seller_id' => $sellerId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'An error occurred while fetching store data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateCustomization(Request $request)
    {
        try {
            $user = Auth::user();
            Log::info('StoreController@updateCustomization called', [
                'user_id' => $user ? $user->userID : 'No user',
                'user_email' => $user ? $user->userEmail : 'No email'
            ]);
            
            $store = Store::where('user_id', $user->userID)->first();
            
            if (!$store) {
                Log::warning('Store not found for user', ['user_id' => $user->userID]);
                return response()->json(['message' => 'Store not found'], 404);
            }

            Log::info('Store found for customization', [
                'store_id' => $store->storeID,
                'store_name' => $store->store_name
            ]);

            $validated = $request->validate([
                'primary_color' => 'sometimes|string|max:7',
                'secondary_color' => 'sometimes|string|max:7',
                'background_color' => 'sometimes|string|max:7',
                'text_color' => 'sometimes|string|max:7',
                'accent_color' => 'sometimes|string|max:7',
                'heading_font' => 'sometimes|string|max:255',
                'body_font' => 'sometimes|string|max:255',
                'heading_size' => 'sometimes|integer|min:12|max:48',
                'body_size' => 'sometimes|integer|min:10|max:24',
                'show_hero_section' => 'sometimes|boolean',
                'show_featured_products' => 'sometimes|boolean',
                'desktop_columns' => 'sometimes|integer|min:2|max:6',
                'mobile_columns' => 'sometimes|integer|min:1|max:3',
                'product_card_style' => 'sometimes|string|in:minimal,detailed,compact,elegant',
                'background_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:8192',
            ]);

            Log::info('Validation passed', ['validated_fields' => array_keys($validated)]);

            // Handle file uploads
            if ($request->hasFile('background_image')) {
                Log::info('Background image upload detected');
                // Delete old background if exists
                if ($store->background_image_path) {
                    Storage::disk('public')->delete($store->background_image_path);
                }
                $validated['background_image_path'] = $request->file('background_image')->store('stores/backgrounds', 'public');
                Log::info('Background image stored', ['path' => $validated['background_image_path']]);
            }

            Log::info('Updating store with data', $validated);
            $store->update($validated);
            Log::info('Store updated successfully', ['store_id' => $store->storeID]);

            return response()->json([
                'message' => 'Store customization updated successfully',
                'store' => $store,
                'background_url' => $store->background_image_path ? url('storage/' . $store->background_image_path) : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in updateCustomization', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user ? $user->userID : 'No user'
            ]);
            return response()->json(['message' => 'An error occurred while updating customization'], 500);
        }
    }
}