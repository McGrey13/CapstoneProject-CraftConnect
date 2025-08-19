<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\CartController;
use App\http\Controllers\ChatController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::get('/sellers/{seller_id}/approvedProduct', [ProductController::class, 'approvedProduct']);
Route::get('/products/approved', [ProductController::class, 'approvedProducts']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/sellers', [AuthController::class, 'getSellers']);

Route::get('/profile', [AuthController::class, 'show']);
// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

Route::middleware(['auth:sanctum'])->get('/admin/products', [ProductController::class, 'adminIndex']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Product routes 
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::resource('/products', ProductController::class);

    //Products Routes Admin Side
    Route::post('/products/{id}/approve', [ProductController::class, 'approve']);
    Route::post('/products/{id}/reject', [ProductController::class, 'reject']);
    Route::put('/products/{id}/update', [ProductController::class, 'update']);
    

    
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'show']);
    Route::post('/profile/deactivate', [AuthController::class, 'deactivate']);
    Route::delete('/profile', [AuthController::class, 'destroy']);

    Route::get('/customers', [AuthController::class, 'getCustomers']);
    Route::get('/admins', [AuthController::class, 'getAdmins']);

    //Cart Routes
     Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);

    //Chat Routes 
     Route::post('/chat/{conversation}/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/{conversation}/messages', [ChatController::class, 'getMessages']);
});