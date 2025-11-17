<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RecommendationService;
use Illuminate\Support\Facades\Auth;

class RecommendationController extends Controller
{
    protected $recommendationService;
    
    public function __construct(RecommendationService $recommendationService)
    {
        $this->recommendationService = $recommendationService;
    }
    
    /**
     * Get personalized recommendations for the current user
     * AI recommendations are only available for authenticated customers
     */
    public function getRecommendations(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            
            // AI recommendations are only available for logged-in customers
            if (!$user) {
                // Return empty recommendations for guest users (no error)
                return response()->json([
                    'success' => true,
                    'recommendations' => [],
                    'count' => 0,
                    'message' => 'Please log in to get personalized recommendations',
                ]);
            }
            
            // Check if user is a customer (not admin/seller)
            // Only provide AI recommendations for customers
            if ($user->role !== 'customer' && $user->role !== null) {
                // Return empty recommendations for non-customers (admin/seller)
                return response()->json([
                    'success' => true,
                    'recommendations' => [],
                    'count' => 0,
                    'message' => 'AI recommendations are only available for customers',
                ]);
            }
            
            $userId = $user->userID;
            $limit = $request->get('limit', 12);
            
            $recommendations = $this->recommendationService->getRecommendations(
                $userId,
                null, // No session ID needed for authenticated users
                $limit
            );
            
            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'count' => count($recommendations),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in getRecommendations: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            // Return empty recommendations on error instead of 500 error
            return response()->json([
                'success' => true,
                'recommendations' => [],
                'count' => 0,
                'message' => 'Failed to get recommendations',
            ]);
        }
    }
    
    /**
     * Track a product view
     */
    public function trackView(Request $request, $productId)
    {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            $userId = $user ? $user->userID : null;
            
            // Get or create session ID for guest users
            // Use cookie-based session ID for API routes (sessions disabled)
            $sessionId = null;
            if (!$userId) {
                // Try to get from cookie first
                $sessionId = $request->cookie('guest_session_id');
                if (!$sessionId) {
                    // Generate new session ID
                    $sessionId = 'guest_' . uniqid('', true) . '_' . time();
                }
            } else {
                // For authenticated users, use user ID as session identifier
                $sessionId = 'user_' . $userId;
            }
            
            $duration = $request->get('duration', 0);
            $tags = $request->get('tags', []);
            $searchQuery = $request->get('search_query');
            
            $tracked = $this->recommendationService->trackProductView(
                $productId,
                $userId,
                $sessionId,
                $duration,
                $tags,
                $searchQuery
            );
            
            $response = response()->json([
                'success' => $tracked,
                'message' => $tracked ? 'Product view tracked successfully' : 'Failed to track product view',
                ]);
            
            // Set cookie for guest users if not already set
            if (!$userId && !$request->cookie('guest_session_id')) {
                $response->cookie('guest_session_id', $sessionId, 60 * 24 * 30); // 30 days
            }
            
            return $response;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in trackView: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error tracking product view',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
    
    /**
     * Get recommended stores
     */
    public function getRecommendedStores(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            $userId = $user ? $user->userID : null;
            
            // Get or create session ID for guest users
            // Use cookie-based session ID for API routes (sessions disabled)
            $sessionId = null;
            if (!$userId) {
                // Try to get from cookie first
                $sessionId = $request->cookie('guest_session_id');
                if (!$sessionId) {
                    // Generate new session ID
                    $sessionId = 'guest_' . uniqid('', true) . '_' . time();
                }
            } else {
                // For authenticated users, use user ID as session identifier
                $sessionId = 'user_' . $userId;
            }
            
            $limit = $request->get('limit', 12);
            
            $storeIds = $this->recommendationService->getRecommendedStores(
                $userId,
                $sessionId,
                $limit
            );
            
            $response = response()->json([
                'success' => true,
                'store_ids' => $storeIds,
                'count' => count($storeIds),
            ]);
            
            // Set cookie for guest users if not already set
            if (!$userId && !$request->cookie('guest_session_id')) {
                $response->cookie('guest_session_id', $sessionId, 60 * 24 * 30); // 30 days
            }
            
            return $response;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in getRecommendedStores: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get recommended stores',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
    
    /**
     * Get purchase history for recommendations
     * Lists all products that the user has purchased
     */
    public function getPurchaseHistory(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be authenticated to view purchase history',
                ], 401);
            }
            
            $limit = $request->get('limit', 50);
            
            // Get all orders for the user
            $orders = \App\Models\Order::where('userID', $user->userID)
                ->where('status', '!=', 'cancelled')
                ->with(['orderProducts.product' => function($query) {
                    $query->with(['seller.user', 'seller.store', 'reviews']);
                }])
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Extract unique products from orders
            $purchasedProducts = [];
            $seenProductIds = [];
            
            foreach ($orders as $order) {
                foreach ($order->orderProducts as $orderProduct) {
                    $product = $orderProduct->product;
                    $productId = $product->product_id ?? $product->id;
                    
                    // Skip if we've already seen this product
                    if (in_array($productId, $seenProductIds)) {
                        continue;
                    }
                    
                    $seenProductIds[] = $productId;
                    
                    // Get first purchase date and last purchase date
                    $firstPurchase = \App\Models\Order::where('userID', $user->userID)
                        ->whereHas('orderProducts', function($q) use ($productId) {
                            $q->where('product_id', $productId);
                        })
                        ->orderBy('created_at', 'asc')
                        ->first();
                    
                    $lastPurchase = \App\Models\Order::where('userID', $user->userID)
                        ->whereHas('orderProducts', function($q) use ($productId) {
                            $q->where('product_id', $productId);
                        })
                        ->orderBy('created_at', 'desc')
                        ->first();
                    
                    // Calculate total quantity purchased
                    $totalQuantity = \App\Models\OrderProduct::whereHas('order', function($q) use ($user) {
                            $q->where('userID', $user->userID);
                        })
                        ->where('product_id', $productId)
                        ->sum('quantity');
                    
                    // Calculate total amount spent
                    $totalAmount = \App\Models\OrderProduct::whereHas('order', function($q) use ($user) {
                            $q->where('userID', $user->userID);
                        })
                        ->where('product_id', $productId)
                        ->get()
                        ->sum(function($op) {
                            return ($op->price ?? 0) * ($op->quantity ?? 0);
                        });
                    
                    $averageRating = 0;
                    $reviewCount = 0;
                    
                    if ($product->reviews && $product->reviews->count() > 0) {
                        $averageRating = round($product->reviews->avg('rating'), 1);
                        $reviewCount = $product->reviews->count();
                    }
                    
                    $productImageUrl = $product->productImage
                        ? url('storage/' . ltrim($product->productImage, '/'))
                        : '';
                    
                    $purchasedProducts[] = [
                        'id' => $product->product_id,
                        'product_id' => $product->product_id,
                        'productName' => $product->productName,
                        'productDescription' => $product->productDescription,
                        'productPrice' => (float) $product->productPrice,
                        'productImage' => $productImageUrl,
                        'productImages' => $product->productImages ?? [],
                        'category' => $product->category,
                        'tags' => $product->tags ?? [],
                        'status' => $product->status,
                        'average_rating' => $averageRating,
                        'reviews_count' => $reviewCount,
                        'first_purchased_at' => $firstPurchase ? $firstPurchase->created_at->toISOString() : null,
                        'last_purchased_at' => $lastPurchase ? $lastPurchase->created_at->toISOString() : null,
                        'total_quantity_purchased' => (int) $totalQuantity,
                        'total_amount_spent' => (float) $totalAmount,
                        'purchase_count' => \App\Models\Order::where('userID', $user->userID)
                            ->whereHas('orderProducts', function($q) use ($productId) {
                                $q->where('product_id', $productId);
                            })
                            ->count(),
                        'seller' => $product->seller ? [
                            'sellerID' => $product->seller->sellerID,
                            'user' => $product->seller->user ? [
                                'userName' => $product->seller->user->userName,
                                'userEmail' => $product->seller->user->userEmail,
                            ] : null,
                            'store' => $product->seller->store ? [
                                'store_name' => $product->seller->store->store_name,
                            ] : null,
                        ] : null,
                    ];
                    
                    if (count($purchasedProducts) >= $limit) {
                        break 2; // Break out of both loops
                    }
                }
            }
            
            // Sort by last purchased date (most recent first)
            usort($purchasedProducts, function($a, $b) {
                $dateA = $a['last_purchased_at'] ? strtotime($a['last_purchased_at']) : 0;
                $dateB = $b['last_purchased_at'] ? strtotime($b['last_purchased_at']) : 0;
                return $dateB <=> $dateA;
            });
            
            return response()->json([
                'success' => true,
                'purchases' => $purchasedProducts,
                'count' => count($purchasedProducts),
                'total_products_purchased' => count($purchasedProducts),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get purchase history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
