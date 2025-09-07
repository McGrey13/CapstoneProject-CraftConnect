<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\StoreController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Public Routes
Route::resource('products', ProductController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/stores/me', [StoreController::class, 'me']);
    Route::post('/stores', [StoreController::class, 'store']);
});
Route::post('/stores/{store}/approve', [StoreController::class, 'approve']);
Route::post('/stores/{store}/reject', [StoreController::class, 'reject']);
Route::get('products/search/{name}', [ProductController::class, 'search']);

// Authentication Routes


// Protected Routes
    Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::resource('products', ProductController::class);
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::get('/user', [AuthController::class, 'user']); // Get authenticated user details
    Route::post('/logout', [AuthController::class, 'logout']); // Logout
    // Route::get('/logout', [AuthController::class, 'logout']);
});
// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']); // Get authenticated user details
    Route::post('/logout', [AuthController::class, 'logout']); // Logout

    

});