<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Public Routes
Route::resource('products', ProductController::class);
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