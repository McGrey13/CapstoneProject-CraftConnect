<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/profile', [AuthController::class, 'show']);
// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

Route::get('/customers', [AuthController::class, 'getCustomers']);
Route::get('/sellers', [AuthController::class, 'getSellers']);
Route::get('/admins', [AuthController::class, 'getAdmins']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Product routes (protected)
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::resource('products', ProductController::class);
    
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [AuthController::class, 'show']);
    Route::post('/profile/deactivate', [AuthController::class, 'deactivate']);
    Route::delete('/profile', [AuthController::class, 'destroy']);
});