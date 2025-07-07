<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\IntegrationController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/login', [LoginController::class, 'login']);
Route::post('/auth/register', [RegisterController::class, 'register']);

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Public category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Public order creation (for guests)
Route::post('/orders', [OrderController::class, 'store']);

// Payment callback routes (no auth required)
Route::post('/payments/massarat/callback', [PaymentController::class, 'handleMassarATCallback'])
    ->name('api.payments.massarat.callback');
Route::post('/payments/paypal/callback', [PaymentController::class, 'handlePayPalCallback'])
    ->name('api.payments.paypal.callback');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [LoginController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Dashboard routes
    Route::middleware('permission:view-dashboard')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);
        Route::get('/dashboard/orders', [DashboardController::class, 'orders']);
        Route::get('/dashboard/products', [DashboardController::class, 'products']);
        Route::get('/dashboard/users', [DashboardController::class, 'users']);
    });

    // Product management routes
    Route::middleware('permission:create-products')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
    });

    Route::middleware('permission:edit-products')->group(function () {
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::post('/products/{product}', [ProductController::class, 'update']); // For multipart/form-data with _method override
        Route::patch('/products/{product}/stock', [ProductController::class, 'updateStock']);
    });

    Route::middleware('permission:delete-products')->group(function () {
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    // Order management routes
    Route::middleware('permission:view-orders')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
    });

    Route::middleware('permission:manage-orders')->group(function () {
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
