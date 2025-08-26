<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SellerController;
use App\Http\Controllers\Auth\CustomerController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\http\Controllers\ChatController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);

Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::get('/sellers/{id}/approvedProduct', [ProductController::class, 'getApprovedProducts'])->whereNumber('id');
Route::get('/products/approved', [ProductController::class, 'approvedProducts']);
Route::get('/sellers/{id}', [SellerController::class, 'getSellerById'])->whereNumber('id');
Route::get('/sellers/{id}/details', [SellerController::class, 'getArtisanDetails'])->whereNumber('id');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products/{id}', [ProductController::class, 'getProductDetails'])->whereNumber('id');
// Route::get('/sellers', [AuthController::class, 'getSellers']);
Route::get('/get/sellers', [SellerController::class, 'getAllSellers']);

Route::get('/profile', [AuthController::class, 'show']);
// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Test route to verify storage is working
Route::get('/test/storage', function () {
    $testPath = 'profile_images/test.jpg';
    $fullUrl = url('storage/' . $testPath);
    return response()->json([
        'message' => 'Storage test',
        'test_path' => $testPath,
        'full_url' => $fullUrl,
        'storage_path' => storage_path('app/public'),
        'public_path' => public_path('storage'),
        'app_url' => env('APP_URL')
    ]);
});

Route::middleware(['auth:sanctum'])->get('/admin/products', [ProductController::class, 'adminIndex']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Product Routes 
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::resource('/products', ProductController::class);
    
    //Seller Routes
   Route::get('sellers/profile', [SellerController::class, 'showProfile']);
    Route::post('sellers/{sellerID}/profile', [SellerController::class, 'updateProfile']);
    Route::post('/user/deactivate', [AuthController::class, 'deactivate']);
    Route::delete('/user', [AuthController::class, 'destroy']);

    //Products Routes in Admin Side
    Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
    Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
    Route::put('/products/{id}/update', [ProductController::class, 'update']);
    
    // Customer Routes
    Route::resource('/customers', CustomerController::class);
    
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'show']);
    Route::get('/customers', [AuthController::class, 'getCustomers']);
    Route::get('/admins', [AuthController::class, 'getAdmins']);
    Route::get('/sellers', [AuthController::class, 'getSellers']);

    //Cart Routes
     Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);

    // Order Routes
    Route::get('/orders', [OrderController::class, 'index']);

    //Chat Routes 
     Route::post('/chat/{conversation}/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/{conversation}/messages', [ChatController::class, 'getMessages']);
});