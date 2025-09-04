<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Auth\SellerController;
use App\Http\Controllers\Auth\CustomerController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\http\Controllers\ChatController;
use App\Http\Controllers\Api\ReviewController;

// Public Routes
Route::middleware([])->group(function () {
    // Auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/users', function () {return User::all();});
    
    // Google OAuth routes
    Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    
    // Public product routes
    Route::get('/products/approved', [ProductController::class, 'approvedProducts']);
    Route::get('/products/featured', [ProductController::class, 'featuredProducts']);
    Route::get('/products/{id}', [ProductController::class, 'getProductDetails'])->whereNumber('id');
    
    // Seller routes
    Route::get('/sellers/{id}/approvedProduct', [ProductController::class, 'getApprovedProducts'])->whereNumber('id');
    Route::get('/sellers/{id}', [SellerController::class, 'getSellerById'])->whereNumber('id');
    Route::get('/sellers/{id}/details', [SellerController::class, 'getArtisanDetails'])->whereNumber('id');
    Route::get('/get/sellers', [SellerController::class, 'getAllSellers']);
    
    // Review routes
    Route::get('/products/{id}/reviews', [ReviewController::class, 'getProductReviews']);
    Route::prefix('products/{product}')->group(function () {
        Route::get('/reviews/{review}', [ReviewController::class, 'show']);
    });
    
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
});

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Discount Code Routes
    Route::apiResource('discount-codes', 'App\Http\Controllers\Api\DiscountCodeController');
    
    // Toggle featured status of a product
    Route::post('/products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured']);
    
    // Review routes
    Route::prefix('products/{product}')->group(function () {
        Route::post('/reviews', [ReviewController::class, 'store']);
    });

    // Profile route
    Route::get('/profile', [AuthController::class, 'show']);
    
    // Cart routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
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
    Route::prefix('chat')->group(function () {
        Route::get('/conversations', [ChatController::class, 'index']);
        Route::post('/conversations', [ChatController::class, 'store']);
        Route::get('/conversations/{conversation}/messages', [ChatController::class, 'messages']);
        Route::post('/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
    });
    
    // Product routes
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::get('products', [ProductController::class, 'index']);
    Route::post('products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured']);
    Route::resource('products', ProductController::class)->except(['index', 'show']);
    
    // Category routes
    Route::get('categories', [CategoryController::class, 'index']);
    
    // Seller routes
    Route::middleware(['role:seller'])->group(function () {
        Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
        Route::get('sellers/profile', [SellerController::class, 'showProfile']);
        Route::post('sellers/{sellerID}/profile', [SellerController::class, 'updateProfile']);
    });
    
    // Admin routes
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
        Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
        Route::get('/admin/products', [ProductController::class, 'adminIndex']);
        Route::resource('customers', CustomerController::class);
    });
    
    // User profile and auth
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/profile', [AuthController::class, 'show']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::delete('/user', [AuthController::class, 'destroy']);
    Route::post('/user/deactivate', [AuthController::class, 'deactivate']);
    
    // User management
    Route::get('/customers', [AuthController::class, 'getCustomers']);
    Route::get('/admins', [AuthController::class, 'getAdmins']);
    Route::get('/sellers', [AuthController::class, 'getSellers']);
});