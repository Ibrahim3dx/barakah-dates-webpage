<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\IntegrationController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\PaymentController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard routes
    Route::middleware('permission:view-dashboard')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);
        Route::get('/dashboard/profit', [DashboardController::class, 'profit']);
        Route::get('/dashboard/best-sellers', [DashboardController::class, 'bestSellers']);
    });

    // Product routes
    Route::middleware('permission:view-products')->group(function () {
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{product}', [ProductController::class, 'show']);
    });

    Route::middleware('permission:create-products')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
    });

    Route::middleware('permission:edit-products')->group(function () {
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::patch('/products/{product}/stock', [ProductController::class, 'updateStock']);
    });

    Route::middleware('permission:delete-products')->group(function () {
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    // Order routes
    Route::middleware('permission:view-orders')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
    });

    Route::middleware('permission:manage-orders')->group(function () {
        Route::post('/orders', [OrderController::class, 'store']);
        Route::put('/orders/{order}', [OrderController::class, 'update']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    });

    // User management routes
    Route::middleware('permission:view-users')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::get('/roles', [UserController::class, 'getRoles']);
    });

    Route::middleware('permission:create-users')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
    });

    Route::middleware('permission:edit-users')->group(function () {
        Route::put('/users/{user}', [UserController::class, 'update']);
    });

    Route::middleware('permission:delete-users')->group(function () {
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    // Profile management
    Route::put('/profile', [UserController::class, 'updateProfile']);

    // Settings routes
    Route::middleware('permission:manage-settings')->group(function () {
        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);
    });

    // Integration routes
    Route::middleware('permission:manage-integrations')->group(function () {
        Route::get('/integrations', [IntegrationController::class, 'index']);
        Route::post('/integrations', [IntegrationController::class, 'store']);
        Route::put('/integrations/{integration}', [IntegrationController::class, 'update']);
        Route::delete('/integrations/{integration}', [IntegrationController::class, 'destroy']);
    });

    // Payment routes
    Route::post('/orders/{order}/payments/initiate', [PaymentController::class, 'initiatePayment'])
        ->name('api.payments.initiate');
    Route::get('/orders/{order}/payments/verify', [PaymentController::class, 'verifyPayment'])
        ->name('api.payments.verify');
});

// Payment callback routes (no auth required)
Route::post('/payments/massarat/callback', [PaymentController::class, 'handleMassarATCallback'])
    ->name('api.payments.massarat.callback');
Route::post('/payments/paypal/callback', [PaymentController::class, 'handlePayPalCallback'])
    ->name('api.payments.paypal.callback'); 