<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\AuthController;

// Public Routes
Route::resource('products', ProductController::class);
Route::get('products/search/{name}', [ProductController::class, 'search']);

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::resource('products', ProductController::class);
    Route::get('products/search/{name}', [ProductController::class, 'search']);
    Route::get('/logout', [AuthController::class, 'logout']);
});
// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});