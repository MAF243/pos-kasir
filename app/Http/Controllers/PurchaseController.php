<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $purchases = Purchase::with(['supplier', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('invoice_no', 'like', "%{$search}%")
                      ->orWhereHas('supplier', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchases/Create', [
            'suppliers' => Supplier::orderBy('name')->get(),
            'products' => Product::orderBy('name')->get(['id', 'name', 'barcode', 'purchase_price', 'selling_price', 'stock']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.purchase_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Generate Invoice No
                $datePrefix = date('Ymd');
                $lastPurchase = Purchase::whereDate('created_at', today())->latest('id')->first();
                $counter = $lastPurchase ? ((int) substr($lastPurchase->invoice_no, -4)) + 1 : 1;
                $invoiceNo = 'INV-PUR-' . $datePrefix . '-' . str_pad($counter, 4, '0', STR_PAD_LEFT);

                // ── Server-Side Recalculation & Precision ──
                $total = 0;
                foreach ($validated['items'] as $item) {
                    $total += round($item['qty'] * $item['purchase_price'], 2);
                }

                $purchase = Purchase::create([
                    'invoice_no' => $invoiceNo,
                    'supplier_id' => $validated['supplier_id'],
                    'user_id' => auth()->id(),
                    'total' => round($total, 2),
                    'status' => 'completed',
                ]);

                // ── Concurrency Deadlock Prevention ──
                // Sort items by product_id ascending to enforce strict lock acquisition order
                $items = collect($validated['items'])->sortBy('product_id')->values()->all();

                foreach ($items as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                    if ($item['purchase_price'] > $product->selling_price) {
                        throw ValidationException::withMessages([
                            'items' => ["The purchase price for {$product->name} cannot exceed its selling price ({$product->selling_price})."]
                        ]);
                    }

                    $subtotal = round($item['qty'] * $item['purchase_price'], 2);

                    PurchaseDetail::create([
                        'purchase_id' => $purchase->id,
                        'product_id' => $product->id,
                        'qty' => $item['qty'],
                        'purchase_price' => $item['purchase_price'],
                        'subtotal' => $subtotal,
                    ]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'type' => 'in',
                        'qty' => $item['qty'],
                        'reference_no' => $purchase->invoice_no,
                        'note' => 'Supplier Purchase',
                    ]);

                    // Update product stock and optionally the purchase_price
                    $product->increment('stock', $item['qty']);
                    $product->update(['purchase_price' => $item['purchase_price']]);
                }
            });

            return redirect()->route('purchases.index')->with('success', 'Purchase recorded successfully.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while recording the purchase: ' . $e->getMessage());
        }
    }

    public function show(Purchase $purchase)
    {
        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase->load(['supplier', 'user', 'details.product']),
        ]);
    }
}
