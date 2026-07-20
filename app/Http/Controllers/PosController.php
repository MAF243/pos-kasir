<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Shift;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class PosController extends Controller
{
    public function index()
    {
        // CRITICAL: Must have an open shift to access POS
        $activeShift = Shift::where('user_id', auth()->id())
                            ->where('status', 'open')
                            ->first();

        if (!$activeShift) {
            return redirect()->route('shifts.index')
                             ->with('error', 'You must open a shift before accessing the POS.');
        }

        $products = Product::with('category')
            ->select('id', 'category_id', 'name', 'barcode', 'selling_price', 'stock', 'image')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'category_id' => $product->category_id,
                    'name' => $product->name,
                    'barcode' => $product->barcode,
                    'price' => $product->selling_price,
                    'stock' => $product->stock,
                    'image_url' => $product->image_url,
                    'category' => $product->category ? ['id' => $product->category->id, 'name' => $product->category->name] : null,
                ];
            });

        return Inertia::render('POS/Index', [
            'shift' => $activeShift,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'customer_id' => 'nullable|exists:customers,id',
            'cart' => 'required|array|min:1',
            'cart.*.product_id' => 'required|exists:products,id',
            'cart.*.qty' => 'required|integer|min:1',
            'cart.*.price' => 'required|numeric|min:0',
            'cart.*.name' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'pay' => 'required|numeric|min:0',
            'change' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,qris',
        ]);

        $isDigital = $validated['payment_method'] === 'qris';
        $transactionId = null;
        $snapToken = null;
        $calculatedTotal = 0;

        try {
            DB::transaction(function () use ($validated, $isDigital, &$transactionId, &$calculatedTotal, &$snapToken) {
                // Verify shift is still open
                $shift = Shift::lockForUpdate()->findOrFail($validated['shift_id']);
                if ($shift->status !== 'open') {
                    throw ValidationException::withMessages([
                        'shift_id' => ['This shift has been closed. Please open a new shift.']
                    ]);
                }

                // ── Server-Side Recalculation (Security) ──
                $calculatedSubtotal = 0;
                foreach ($validated['cart'] as $item) {
                    $calculatedSubtotal += round($item['qty'] * $item['price'], 2);
                }
                $discount = round($validated['discount'] ?? 0, 2);
                $calculatedTotal = round($calculatedSubtotal - $discount, 2);

                if ($calculatedTotal < 0) {
                    throw ValidationException::withMessages(['total' => 'Total cannot be negative.']);
                }

                $pay = round($validated['pay'], 2);
                $calculatedChange = round($pay - $calculatedTotal, 2);
                
                // For cash payments, pay must be >= total
                if (!$isDigital && $calculatedChange < 0) {
                    throw ValidationException::withMessages(['pay' => 'Insufficient payment amount.']);
                }

                // Generate Invoice No
                $datePrefix = date('Ymd');
                $lastTx = Transaction::whereDate('created_at', today())->latest('id')->first();
                $counter = $lastTx ? ((int) substr($lastTx->invoice_no, -4)) + 1 : 1;
                $invoiceNo = 'INV-' . $datePrefix . '-' . str_pad($counter, 4, '0', STR_PAD_LEFT);

                $transaction = Transaction::create([
                    'invoice_no' => $invoiceNo,
                    'shift_id' => $validated['shift_id'],
                    'customer_id' => $validated['customer_id'] ?? null,
                    'subtotal' => $calculatedSubtotal,
                    'discount' => $discount,
                    'total' => $calculatedTotal,
                    'pay' => $pay,
                    'change' => $calculatedChange,
                    'payment_method' => $validated['payment_method'],
                    // Cash is immediately 'success'; digital starts 'pending' until webhook confirms
                    'status' => $isDigital ? 'pending' : 'success',
                ]);

                // ── Concurrency Deadlock Prevention ──
                // Sort cart by product_id ascending to enforce strict lock acquisition order
                $cart = collect($validated['cart'])->sortBy('product_id')->values()->all();

                foreach ($cart as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                    if ($product->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'cart' => ["Insufficient stock for \"{$product->name}\". Available: {$product->stock}, requested: {$item['qty']}."]
                        ]);
                    }

                    $subtotal = round($item['qty'] * $item['price'], 2);

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'qty' => $item['qty'],
                        'price' => $item['price'],
                        'subtotal' => $subtotal,
                    ]);

                    // For digital payments, stock is deducted optimistically.
                    // The webhook will REVERT it if payment fails.
                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'type' => 'out',
                        'qty' => $item['qty'],
                        'reference_no' => $invoiceNo,
                        'note' => $isDigital ? 'POS Sales (Digital — Pending Confirmation)' : 'POS Sales',
                    ]);

                    $product->decrement('stock', $item['qty']);
                }

                $transactionId = $transaction->id;

                // ── Generate Snap Token for digital payments ──
                if ($isDigital) {
                    try {
                        MidtransConfig::$serverKey = config('midtrans.server_key');
                        MidtransConfig::$isProduction = config('midtrans.is_production');
                        MidtransConfig::$isSanitized = config('midtrans.is_sanitized');
                        MidtransConfig::$is3ds = config('midtrans.is_3ds');

                        $params = [
                            'transaction_details' => [
                                'order_id' => $transaction->invoice_no,
                                'gross_amount' => (int) $transaction->total,
                            ],
                            'item_details' => $validated['cart']
                                ? array_map(function ($item) {
                                    return [
                                        'id' => (string) $item['product_id'],
                                        'price' => (int) $item['price'],
                                        'quantity' => (int) $item['qty'],
                                        'name' => substr($item['name'], 0, 50), // Midtrans limit: 50 chars
                                    ];
                                }, $validated['cart'])
                                : [],
                            'customer_details' => [
                                'first_name' => auth()->user()->name,
                            ],
                            'callbacks' => [
                                'finish' => url('/pos/receipt/' . $transactionId),
                            ],
                        ];

                        // Add discount as a negative-amount item if present
                        $discount = round($validated['discount'] ?? 0, 2);
                        if ($discount > 0) {
                            $params['item_details'][] = [
                                'id' => 'DISCOUNT',
                                'price' => -(int) $discount,
                                'quantity' => 1,
                                'name' => 'Discount',
                            ];
                        }

                        $snapToken = Snap::getSnapToken($params);
                    } catch (\Exception $e) {
                        throw new \Exception('Payment Gateway is temporarily unavailable. Please try again or use Cash.');
                    }
                }
            });

            return response()->json([
                'success' => true,
                'transaction_id' => $transactionId,
                'snap_token' => $snapToken,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function receipt(Transaction $transaction)
    {
        return Inertia::render('POS/Receipt', [
            'transaction' => $transaction->load([
                'transactionDetails.product',
                'shift.user',
                'customer',
            ]),
        ]);
    }
}
