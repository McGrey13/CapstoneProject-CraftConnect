<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\AdminController;
use App\Http\Controllers\Auth\SellerController;
use App\Http\Controllers\Auth\CustomerController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\http\Controllers\ChatController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DiscountCodeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\SellerFollowController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Work_and_EventsController;

// Public Routes
Route::middleware([])->group(function () {
    // Test endpoint for debugging
    Route::get('/test-stores', function () {
        return response()->json(['message' => 'API is working', 'timestamp' => now()]);
    });
    
    // CORS Test endpoint
    Route::get('/test-cors', function () {
        return response()->json([
            'message' => 'CORS is working!',
            'timestamp' => now(),
            'origin' => request()->header('Origin'),
            'headers' => request()->headers->all()
        ]);
    });
    
    // Test user data with city and province
    Route::middleware(['auth:sanctum'])->get('/test-user-data', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }
        
        return response()->json([
            'user_data' => [
                'userID' => $user->userID,
                'userName' => $user->userName,
                'userEmail' => $user->userEmail,
                'userAddress' => $user->userAddress,
                'userCity' => $user->userCity,
                'userProvince' => $user->userProvince,
                'userRegion' => $user->userRegion,
                'role' => $user->role,
            ]
        ]);
    });
    
    // Simple auth test endpoint
    Route::middleware(['auth:sanctum'])->get('/test-auth', function () {
        return response()->json([
            'message' => 'Authenticated successfully',
            'user' => Auth::user()->userName ?? 'Unknown'
        ]);
    });
    
    // Auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    
    // Public product routes
    Route::get('/products/approved', [ProductController::class, 'approvedProducts']);
    Route::get('/products/featured', [ProductController::class, 'featuredProducts']);
    Route::get('/products/{id}', [ProductController::class, 'getProductDetails'])->whereNumber('id');
    
    // Public work and events routes (for customers to view)
    Route::get('/work-and-events/public', [Work_and_EventsController::class, 'getPublicWorkAndEvents']);
    Route::get('/work-and-events/public/{id}', [Work_and_EventsController::class, 'getPublicWorkAndEventById'])->whereNumber('id');
    
    // Public products endpoints for admin (without authentication)
    Route::get('/products-public', function() {
        $products = App\Models\Product::with('seller.user')
            ->where('approval_status', '!=', 'draft')
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'product_id' => $product->product_id,
                    'productName' => $product->productName,
                    'productDescription' => $product->productDescription,
                    'productPrice' => $product->productPrice,
                    'productQuantity' => $product->productQuantity,
                    'productImage' => $product->productImage,
                    'category' => $product->category,
                    'status' => $product->status,
                    'approval_status' => $product->approval_status,
                    'seller_id' => $product->seller_id,
                    'seller' => $product->seller ? [
                        'sellerID' => $product->seller->sellerID,
                        'user' => $product->seller->user ? [
                            'userName' => $product->seller->user->userName,
                            'userEmail' => $product->seller->user->userEmail,
                            'userAddress' => $product->seller->user->userAddress,
                        ] : null
                    ] : null,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            });
        
        return response()->json($products);
    });

    // Public product details endpoint for admin (without authentication)
    Route::get('/products-public/{id}', function($id) {
        try {
            $product = App\Models\Product::with('seller.user')
                ->where('product_id', $id)
                ->where('approval_status', '!=', 'draft')
                ->first();
            
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }
            
            return response()->json([
                'id' => $product->id,
                'product_id' => $product->product_id,
                'productName' => $product->productName,
                'productDescription' => $product->productDescription,
                'productPrice' => $product->productPrice,
                'productQuantity' => $product->productQuantity,
                'productImage' => $product->productImage,
                'category' => $product->category,
                'status' => $product->status,
                'approval_status' => $product->approval_status,
                'seller_id' => $product->seller_id,
                'seller' => $product->seller ? [
                    'sellerID' => $product->seller->sellerID,
                    'user' => $product->seller->user ? [
                        'userName' => $product->seller->user->userName,
                        'userEmail' => $product->seller->user->userEmail,
                        'userAddress' => $product->seller->user->userAddress,
                    ] : null
                ] : null,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
    
    // Public orders endpoint for testing
    Route::get('/orders-test', function() {
        $orders = App\Models\Order::with(['customer', 'user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->orderID,
                    'customer' => $order->customer ? $order->customer->firstName . ' ' . $order->customer->lastName : 'Unknown Customer',
                    'date' => $order->created_at->format('Y-m-d'),
                    'amount' => '₱' . number_format($order->totalAmount, 2),
                    'status' => ucfirst($order->status),
                    'items' => 1, // Default for now, can be calculated from order_products table
                    'location' => $order->location ?? 'N/A'
                ];
            });
        
        return response()->json($orders);
    });
    
    // Seller routes
    Route::get('/sellers/{id}/approvedProduct', [ProductController::class, 'getApprovedProducts'])->whereNumber('id');
    Route::get('/sellers/{id}', [SellerController::class, 'getSellerById'])->whereNumber('id');
    Route::get('/sellers/{id}/details', [SellerController::class, 'getArtisanDetails'])->whereNumber('id');
    Route::get('/sellers/{id}/store', [StoreController::class, 'getStoreBySeller'])->whereNumber('id');
    Route::get('/get/sellers', [SellerController::class, 'getAllSellers']);
    
    // Public store routes
    Route::get('/stores', [StoreController::class, 'index']);
    
    // Review routes
    Route::get('/products/{id}/reviews', [ReviewController::class, 'getProductReviews']);
    Route::prefix('products/{product}')->group(function () {
        Route::get('/reviews/{review}', [ReviewController::class, 'show']);
    });
    
    // Profile route (moved to protected section)
    
    // Test routes
    Route::get('/test', function () {
        return response()->json(['message' => 'API is working!']);
    });
    
    Route::get('/test/storage', function () {
        $testPath = 'profile_images/test.jpg';
        $fullUrl = url('storage/' . $testPath);
        return response()->json([
            'message' => 'Storage test',
            'url' => $fullUrl,
            'storage_path' => storage_path('app/public/' . $testPath),
            'public_path' => public_path('storage/' . $testPath)
        ]);
    });
    
    Route::get('/test/email', function () {
        try {
            $result = \App\Services\EmailService::sendOtpEmail(
                'test@example.com',
                'Test User',
                '123456'
            );
            
            return response()->json([
                'message' => 'Email test completed',
                'result' => $result,
                'ssl_options' => \App\Helpers\SslHelper::getSslOptions()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Email test failed',
                'error' => $e->getMessage(),
                'ssl_options' => \App\Helpers\SslHelper::getSslOptions()
            ], 500);
        }
    });
    
    Route::get('/test/location', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Please login first'], 401);
        }
        
        return response()->json([
            'message' => 'Location test',
            'user_location' => [
                'userAddress' => $user->userAddress,
                'userId' => $user->userID,
                'userName' => $user->userName
            ]
        ]);
    });
    
    Route::get('/test/profile', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Please login first'], 401);
        }
        
        return response()->json([
            'message' => 'Profile test',
            'user_data' => [
                'id' => $user->userID,
                'userName' => $user->userName,
                'userEmail' => $user->userEmail,
                'userContactNumber' => $user->userContactNumber,
                'userAddress' => $user->userAddress,
                'userCity' => $user->userCity,                  
                'userRegion' => $user->userRegion,
                'userProvince' => $user->userProvince,
                'role' => $user->role
            ]
        ]);
    });

    Route::get('/test/debug-profile', function () {
        try {
            $user = Auth::user();
            $authHeader = request()->header('Authorization');
            
            return response()->json([
                'message' => 'Debug Profile Test',
                'auth_header' => $authHeader ? 'Present' : 'Missing',
                'user_authenticated' => $user ? true : false,
                'user_id' => $user ? $user->userID : 'Not authenticated',
                'user_data' => $user ? [
                    'userName' => $user->userName,
                    'userEmail' => $user->userEmail,
                    'userContactNumber' => $user->userContactNumber,
                    'userCity' => $user->userCity,
                    'role' => $user->role
                ] : 'No user data'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Debug error',
                'error' => $e->getMessage()
            ], 500);
        }
    });
});

// Protected routes 
Route::middleware(['auth:sanctum'])->group(function () {
    // Protected review routes
    Route::prefix('products/{product}')->group(function () {
        Route::post('/reviews', [ReviewController::class, 'store']);
    });
    
    // Cart routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'store']);
        Route::put('/update/{id}', [CartController::class, 'update']);
        Route::delete('/remove/{id}', [CartController::class, 'destroy']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::post('/checkout', [CartController::class, 'checkout']);
    });
    
    // Order routes
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/seller', [OrderController::class, 'sellerOrders']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/', [OrderController::class, 'store']);
    });

    // Payment Method routes
    Route::prefix('payment-methods')->group(function () {
        Route::get('/', [PaymentMethodController::class, 'index']);
        Route::post('/', [PaymentMethodController::class, 'store']);
        Route::get('/{id}', [PaymentMethodController::class, 'show']);
        Route::put('/{id}', [PaymentMethodController::class, 'update']);
        Route::delete('/{id}', [PaymentMethodController::class, 'destroy']);
        Route::post('/{id}/set-default', [PaymentMethodController::class, 'setDefault']);
    });
    
    // Chat routes
    // Route::prefix('chat')->group(function () {
    //     Route::get('/conversations', [ChatController::class, 'index']);
    //     Route::post('/conversations', [ChatController::class, 'store']);
    //     Route::get('/conversations/{conversation}/messages', [ChatController::class, 'messages']);
    //     Route::post('/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
    // });
    
    // Product management routes (for sellers with verified stores)
    Route::middleware(['role:seller', 'verified.store'])->group(function () {
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
    });
    
    // Admin routes
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
        Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
        
        // Store verification routes
        Route::prefix('admin')->group(function () {
            Route::get('/stores', [AdminController::class, 'getAllStores']);
            Route::get('/stores/{storeId}', [AdminController::class, 'getStoreDetails']);
            Route::get('/stores/{storeId}/documents', [AdminController::class, 'getStoreDocuments']);
            Route::post('/stores/{storeId}/approve', [AdminController::class, 'approveStore']);
            Route::post('/stores/{storeId}/reject', [AdminController::class, 'rejectStore']);
            Route::get('/verification-stats', [AdminController::class, 'getVerificationStats']);
            Route::post('/sellers/{sellerId}/verify', [AdminController::class, 'verifySeller']);
        });
        
        // Analytics routes
        Route::prefix('analytics')->group(function () {
            Route::get('/admin', [AnalyticsController::class, 'getAdminAnalytics']);
            Route::post('/generate', [AnalyticsController::class, 'generateAnalyticsData']);
            Route::get('/test', function() {
                return response()->json(['message' => 'Analytics test endpoint working']);
            });
        });
    });
    
    // User profile
    Route::get('/profile', [AuthController::class, 'show']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/update-location', [AuthController::class, 'updateLocation']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// Test analytics without authentication
Route::get('/analytics/test-simple', function() {
    return response()->json(['message' => 'Simple analytics test working']);
});

Route::get('/analytics/test-controller', [AnalyticsController::class, 'getAdminAnalytics']);

// Public analytics generate endpoint for testing
Route::post('/analytics/generate-public', [AnalyticsController::class, 'generateAnalyticsData']);

// Micro analytics endpoints
Route::get('/analytics/micro/rating-breakdown', [AnalyticsController::class, 'getDetailedRatingBreakdown']);
Route::get('/analytics/micro/product-comparison', [AnalyticsController::class, 'getProductSellerComparison']);
Route::get('/analytics/micro/competitive-analysis', [AnalyticsController::class, 'getCompetitiveAnalysis']);

// New micro analytics endpoints
Route::get('/analytics/micro/most-selling-products', [AnalyticsController::class, 'getMostSellingProducts']);
Route::get('/analytics/micro/highest-sales-sellers', [AnalyticsController::class, 'getHighestSalesSellers']);
Route::get('/analytics/micro/product-trend/{productId}', [AnalyticsController::class, 'getProductSellingTrend']);
Route::get('/analytics/micro/seller-trend/{sellerId}', [AnalyticsController::class, 'getSellerSalesTrend']);

// Seller analytics endpoints
Route::get('/analytics/seller/{seller_id}', function($seller_id) {
    try {
        // Check if seller exists
        $seller = App\Models\Seller::where('sellerID', $seller_id)->first();
        if (!$seller) {
            return response()->json(['error' => 'Seller not found'], 404);
        }

        // Get seller's products with relationships
        $products = App\Models\Product::where('seller_id', $seller_id)
            ->with(['orders' => function($query) {
                $query->orderBy('created_at', 'desc');
            }, 'reviews'])
            ->get();

        // Get seller's orders
        $orders = App\Models\Order::whereHas('products', function($query) use ($seller_id) {
            $query->where('seller_id', $seller_id);
        })->with('products')->get();

        // Get seller's discount codes
        $discountCodes = App\Models\DiscountCode::where('created_by', $seller->user->userID)->get();

        // Calculate total revenue
            $totalRevenue = $orders->sum(function($order) {
            return $order->totalAmount;
        });

        // Calculate order status metrics
        $orderStatusMetrics = [
            'total_orders' => $orders->count(),
            'completed' => $orders->where('status', 'delivered')->count(),
            'pending' => $orders->where('status', 'pending')->count(),
            'packing' => $orders->where('status', 'packing')->count(),
            'shipped' => $orders->where('status', 'shipped')->count(),
            'completion_rate' => $orders->count() > 0 
                ? ($orders->where('status', 'delivered')->count() / $orders->count()) * 100 
                : 0
        ];

        // Calculate revenue by product
        $revenueByProduct = $products->map(function($product) {
            $totalRevenue = $product->orders->sum(function($order) use ($product) {
                $productOrder = $order->products->firstWhere('product_id', $product->product_id);
                return $productOrder ? $productOrder->pivot->quantity * $productOrder->pivot->price : 0;
            });
            $totalUnits = $product->orders->sum('pivot.quantity');
            $viewCount = $product->view_count ?? rand(50, 200); // Using random view count for now
            $conversionRate = $viewCount > 0 ? ($totalUnits / $viewCount) * 100 : 0;
            $inventoryTurnover = $product->productQuantity > 0 ? $totalUnits / $product->productQuantity : 0;

            return [
                'product_id' => $product->product_id,
                'name' => $product->productName,
                'revenue' => $totalRevenue,
                'units_sold' => $totalUnits,
                'views' => $viewCount,
                'conversion_rate' => $conversionRate,
                'inventory_turnover' => $inventoryTurnover
            ];
        });

        // Calculate revenue by category
        $revenueByCategory = $products->groupBy('category')->map(function($products) {
            return [
                'revenue' => $products->sum(function($product) {
                    return $product->orders->sum(function($order) use ($product) {
                        $productOrder = $order->products->firstWhere('product_id', $product->product_id);
                        return $productOrder ? $productOrder->pivot->quantity * $productOrder->pivot->price : 0;
                    });
                }),
                'units_sold' => $products->sum(function($product) {
                    return $product->orders->sum('pivot.quantity');
                })
            ];
        });

        // Calculate monthly trends (last 12 months)
        $monthlyTrends = collect(range(0, 11))->map(function($month) use ($orders) {
            $date = now()->subMonths($month);
            $monthOrders = $orders->filter(function($order) use ($date) {
                return $order->created_at->format('Y-m') === $date->format('Y-m');
            });
            
            $monthRevenue = $monthOrders->sum(function($order) {
                return $order->totalAmount;
            });
            
            return [
                'month' => $date->format('Y-m'),
                'revenue' => $monthRevenue,
                'orders' => $monthOrders->count()
            ];
        })->reverse()->values();

        // Get best-selling products
        $bestSellers = $revenueByProduct->sortByDesc('units_sold')->take(5)->values();

        // Get low-performing products (low inventory turnover)
        $lowPerformers = $revenueByProduct->sortBy('inventory_turnover')->take(5)->values();

        // Calculate discount code statistics
        $discountStats = [
            'total_codes' => $discountCodes->count(),
            'codes_used' => $discountCodes->sum('times_used'),
            'total_discount_amount' => $discountCodes->sum('value'),
            'active_codes' => $discountCodes->filter(function($code) {
                return (!$code->expires_at || $code->expires_at->isFuture()) &&
                       (!$code->usage_limit || $code->times_used < $code->usage_limit);
            })->count(),
            'expired_codes' => $discountCodes->filter(function($code) {
                return ($code->expires_at && $code->expires_at->isPast()) ||
                       ($code->usage_limit && $code->times_used >= $code->usage_limit);
            })->count()
        ];

        // Calculate peak selling periods
        $peakPeriods = $monthlyTrends
            ->sortByDesc('revenue')
            ->take(3)
            ->map(function($period) {
                return [
                    'month' => $period['month'],
                    'revenue' => $period['revenue'],
                    'orders' => $period['orders']
                ];
            })
            ->values();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'revenue_by_product' => $revenueByProduct,
            'revenue_by_category' => $revenueByCategory,
            'monthly_trends' => $monthlyTrends,
            'best_sellers' => $bestSellers,
            'low_performers' => $lowPerformers,
            'discount_stats' => $discountStats,
            'order_metrics' => $orderStatusMetrics,
            'peak_periods' => $peakPeriods
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Admin products route
Route::middleware(['auth:sanctum'])->get('/admin/products', [ProductController::class, 'adminIndex']);

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Product Routes 
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::resource('/products', ProductController::class);

    //Toggle Featured Product
    Route::post('/products/{id}/toggle-featured', [ProductController::class, 'toggleFeatured']);
    //Toggle Publish Status
    Route::post('/products/{id}/toggle-publish', [ProductController::class, 'togglePublishStatus']);
     Route::get('/seller/products', [ProductController::class, 'index']);

    //Discount Code Routes
    Route::resource('/discount-codes', DiscountCodeController::class);
        Route::get('/discount-codes', [DiscountCodeController::class, 'index']);
        Route::post('/discount-codes', [DiscountCodeController::class, 'store']);
        Route::delete('/discount-codes/{id}', [DiscountCodeController::class, 'destroy']);
    
    //Seller Routes
   Route::get('sellers/profile', [SellerController::class, 'showProfile']);
    Route::post('sellers/{sellerID}/profile', [SellerController::class, 'updateSellerProfile']);
    Route::post('/user/deactivate', [AuthController::class, 'deactivate']);
    Route::delete('/user', [AuthController::class, 'destroy']);

    //Products Routes in Admin Side
    Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
    Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
    Route::put('/products/{id}/update', [ProductController::class, 'update']);
    
    // Store Routes
    Route::prefix('stores')->group(function () {
        Route::get('/me', [StoreController::class, 'me']);
        Route::post('/', [StoreController::class, 'store']);
        Route::post('/customization', [StoreController::class, 'updateCustomization']);
        Route::get('/dashboard', [StoreController::class, 'getDashboardData']);
        Route::get('/{store}', [StoreController::class, 'show']);
        Route::put('/{store}', [StoreController::class, 'update']);
        Route::delete('/{store}', [StoreController::class, 'destroy']);
        Route::post('/{store}/approve', [StoreController::class, 'approve']);
        Route::post('/{store}/reject', [StoreController::class, 'reject']);
    });
    
    // Customer Routes
    Route::resource('/customers', CustomerController::class);
    
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/customers', [AuthController::class, 'getCustomers']);
    Route::get('/admins', [AuthController::class, 'getAdmins']);
    Route::get('/sellers', [AuthController::class, 'getSellers']);

    // Order Routes
    Route::get('/orders', [OrderController::class, 'index']);

    //Chat Routes 
    Route::post('/conversations', [ChatController::class, 'createConversation']);
    Route::get('/conversations/with-seller/{sellerId}', [ChatController::class, 'getConversationWithSeller']);
    Route::post('/chat/{conversation}/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/{conversation}/messages', [ChatController::class, 'getMessages']);
    
    // Seller Chat Routes
    Route::get('/chat/seller/conversations', [ChatController::class, 'getSellerConversations']);
    Route::get('/chat/seller/conversation/{customerId}', [ChatController::class, 'getConversationWithCustomer']);
    Route::post('/chat/{conversation}/mark-read', [ChatController::class, 'markMessagesAsRead']);

    Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment']);
    Route::post('/payment-session', [PaymentController::class, 'paymentSession']);
    Route::get('/payment/success/{payment_id}', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
    Route::get('/payment/failed/{payment_id}', [PaymentController::class, 'paymentFailed'])->name('payment.failed');

    
    // Webhook doesn't need auth
    Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook']);

    // Seller Follow Routes
    Route::post('/sellers/{seller}/follow', [SellerFollowController::class, 'follow']);
    Route::post('/sellers/{seller}/unfollow', [SellerFollowController::class, 'unfollow']);
    Route::get('/user/followed-sellers', [SellerFollowController::class, 'followedSellers']);
    Route::get('/products/followed-sellers', [ProductController::class, 'followedSellerProducts']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::apiResource('work-and-events', Work_and_EventsController::class);
    });
});