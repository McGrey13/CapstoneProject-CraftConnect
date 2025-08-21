<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SellerController;
use App\Http\Controllers\CartController;
use App\http\Controllers\ChatController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::get('/sellers/{id}/approvedProduct', [ProductController::class, 'getApprovedProducts']);
Route::get('/products/approved', [ProductController::class, 'approvedProducts']);
Route::get('/sellers/{id}', [SellerController::class, 'getSellerById']);
Route::get('/sellers/{id}/details', [SellerController::class, 'getArtisanDetails']);
Route::post('/login', [AuthController::class, 'login']);
// Route::get('/sellers', [AuthController::class, 'getSellers']);
Route::get('/get/sellers', [SellerController::class, 'getAllSellers']);

Route::get('/profile', [AuthController::class, 'show']);
// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

Route::middleware(['auth:sanctum'])->get('/admin/products', [ProductController::class, 'adminIndex']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Product Routes 
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::resource('/products', ProductController::class);
    
    //Seller Routes
   Route::get('sellers/profile', [SellerController::class, 'showProfile']);
    Route::post('sellers/{id}/profile', [SellerController::class, 'updateProfile']);
    Route::post('/user/deactivate', [AuthController::class, 'deactivate']);
    Route::delete('/user', [AuthController::class, 'destroy']);

    //Products Routes in Admin Side
    Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
    Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
    Route::put('/products/{id}/update', [ProductController::class, 'update']);
    
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
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);

    //Chat Routes 
     Route::post('/chat/{conversation}/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/{conversation}/messages', [ChatController::class, 'getMessages']);
});