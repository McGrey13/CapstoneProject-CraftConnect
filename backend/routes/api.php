<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SellerController;
use App\Http\Controllers\Auth\CustomerController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\http\Controllers\ChatController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DiscountCodeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SellerFollowController;
use App\Http\Controllers\AnalyticsController;

// Public Routes
Route::middleware([])->group(function () {
    // Test endpoint for debugging
    Route::get('/test-stores', function () {
        return response()->json(['message' => 'API is working', 'timestamp' => now()]);
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
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/', [OrderController::class, 'store']);
    });
    
    // Chat routes
    // Route::prefix('chat')->group(function () {
    //     Route::get('/conversations', [ChatController::class, 'index']);
    //     Route::post('/conversations', [ChatController::class, 'store']);
    //     Route::get('/conversations/{conversation}/messages', [ChatController::class, 'messages']);
    //     Route::post('/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
    // });
    
    // Product management routes (for sellers)
    Route::middleware(['role:seller'])->group(function () {
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
    });
    
    // Admin routes
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
        Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
        
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
    Route::post('sellers/{sellerID}/profile', [SellerController::class, 'updateProfile']);
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
        Route::get('/{store}', [StoreController::class, 'show']);
        Route::put('/{store}', [StoreController::class, 'update']);
        Route::delete('/{store}', [StoreController::class, 'destroy']);
        Route::post('/{store}/approve', [StoreController::class, 'approve']);
        Route::post('/{store}/reject', [StoreController::class, 'reject']);
        Route::post('/customization', [StoreController::class, 'updateCustomization']);
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
    Route::get('/payment/success/{payment_id}', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
    Route::get('/payment/failed/{payment_id}', [PaymentController::class, 'paymentFailed'])->name('payment.failed');

    
    // Webhook doesn't need auth
    Route::post('/payments/webhook', [PaymentController::class, 'handleWebhook']);

    // Seller Follow Routes
    Route::post('/sellers/{seller}/follow', [SellerFollowController::class, 'follow']);
    Route::post('/sellers/{seller}/unfollow', [SellerFollowController::class, 'unfollow']);
    Route::get('/user/followed-sellers', [SellerFollowController::class, 'followedSellers']);
    Route::get('/products/followed-sellers', [ProductController::class, 'followedSellerProducts']);
});