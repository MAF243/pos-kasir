<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // User & Role Management (protected by spatie middleware)
    Route::middleware('permission:manage_roles')->resource('roles', RoleController::class)->except(['show']);
    Route::middleware('permission:manage_users')->resource('users', UserController::class)->except(['show']);

    // Master Data
    Route::middleware('permission:manage_categories')->resource('categories', App\Http\Controllers\CategoryController::class)->except(['show']);
    Route::middleware('permission:manage_suppliers')->resource('suppliers', App\Http\Controllers\SupplierController::class)->except(['show']);
    Route::middleware('permission:manage_customers')->resource('customers', App\Http\Controllers\CustomerController::class)->except(['show']);
    Route::middleware('permission:manage_products')->resource('products', App\Http\Controllers\ProductController::class)->except(['show']);

    // Inventory
    Route::middleware('permission:manage_stock')->resource('stock-movements', App\Http\Controllers\StockMovementController::class)->only(['index', 'create', 'store']);
    Route::middleware('permission:manage_stock')->resource('stock-opnames', App\Http\Controllers\StockOpnameController::class)->only(['index', 'create', 'store', 'show']);

    // Purchases
    Route::middleware('permission:manage_purchases')->resource('purchases', App\Http\Controllers\PurchaseController::class)->only(['index', 'create', 'store', 'show']);
    Route::middleware('permission:manage_purchases')->resource('supplier-returns', App\Http\Controllers\SupplierReturnController::class)->only(['index', 'create', 'store', 'show']);

    // Cashier Shifts
    Route::resource('shifts', App\Http\Controllers\CashierShiftController::class)->only(['index', 'create', 'store', 'show', 'update']);

    // POS
    Route::get('/pos', [App\Http\Controllers\PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [App\Http\Controllers\PosController::class, 'store'])->name('pos.store')->middleware('throttle:10,1');
    Route::get('/pos/receipt/{transaction}', [App\Http\Controllers\PosController::class, 'receipt'])->name('pos.receipt');

    // Transaction History
    Route::middleware('permission:view_transactions')->group(function () {
        Route::get('/transactions', [App\Http\Controllers\TransactionHistoryController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/{transaction}', [App\Http\Controllers\TransactionHistoryController::class, 'show'])->name('transactions.show');
    });
    Route::middleware('permission:void_transaction')
        ->post('/transactions/{transaction}/void', [App\Http\Controllers\TransactionHistoryController::class, 'void'])
        ->name('transactions.void');

    // Customer Returns
    Route::middleware('permission:manage_returns')->group(function () {
        Route::get('/customer-returns', [App\Http\Controllers\CustomerReturnController::class, 'index'])->name('customer-returns.index');
        Route::get('/customer-returns/create', [App\Http\Controllers\CustomerReturnController::class, 'create'])->name('customer-returns.create');
        Route::post('/customer-returns', [App\Http\Controllers\CustomerReturnController::class, 'store'])->name('customer-returns.store')->middleware('throttle:10,1');
        Route::get('/customer-returns/{customerReturn}', [App\Http\Controllers\CustomerReturnController::class, 'show'])->name('customer-returns.show');
        Route::post('/customer-returns/{customerReturn}/approve', [App\Http\Controllers\CustomerReturnController::class, 'approve'])->name('customer-returns.approve');
        Route::post('/customer-returns/{customerReturn}/reject', [App\Http\Controllers\CustomerReturnController::class, 'reject'])->name('customer-returns.reject');
    });

    // Expenses
    Route::resource('expenses', App\Http\Controllers\ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);

    // Reports
    Route::middleware('permission:view_reports')->group(function () {
        Route::get('/reports/sales', [App\Http\Controllers\SalesReportController::class, 'index'])->name('reports.sales');
        Route::get('/reports/profit', [App\Http\Controllers\ProfitReportController::class, 'index'])->name('reports.profit');
        Route::get('/reports/stock', [App\Http\Controllers\StockReportController::class, 'index'])->name('reports.stock');
    });

    // Settings
    Route::middleware('permission:manage_settings')->group(function () {
        Route::get('/settings', [App\Http\Controllers\StoreSettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [App\Http\Controllers\StoreSettingController::class, 'update'])->name('settings.update');
    });
});


// Midtrans server-to-server webhook (outside auth middleware, CSRF excluded in bootstrap/app.php)
Route::post('/api/midtrans/callback', [App\Http\Controllers\MidtransCallbackController::class, 'handle'])->name('midtrans.callback');
