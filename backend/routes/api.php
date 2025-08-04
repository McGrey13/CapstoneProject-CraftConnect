<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CustomerApiController;

// Public Routes
Route::resource('products', ProductController::class);
Route::get('products/search/{name}', [ProductController::class, 'search']);

// Authentication Routes
Route::post('/register', [AuthApiController::class, 'register']);
Route::post('/login', [AuthApiController::class, 'login']);

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
    Route::get('/user', [AuthApiController::class, 'user']); // Get authenticated user details
    Route::post('/logout', [AuthApiController::class, 'logout']); // Logout

    

});