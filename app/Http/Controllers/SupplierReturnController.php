<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseReturn;
use App\Models\PurchaseReturnDetail;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class SupplierReturnController extends Controller
{
    public function index(Request $request)
    {
        $returns = PurchaseReturn::with(['supplier', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('return_no', 'like', "%{$search}%")
                      ->orWhereHas('supplier', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('SupplierReturns/Index', [
            'returns' => $returns,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SupplierReturns/Create', [
            'suppliers' => Supplier::orderBy('name')->get(),
            'products' => Product::orderBy('name')->get(['id', 'name', 'barcode', 'purchase_price', 'stock']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Generate Return No
                $datePrefix = date('Ymd');
                $lastReturn = PurchaseReturn::whereDate('created_at', today())->latest('id')->first();
                $counter = $lastReturn ? ((int) substr($lastReturn->return_no, -4)) + 1 : 1;
                $returnNo = 'RET-SUP-' . $datePrefix . '-' . str_pad($counter, 4, '0', STR_PAD_LEFT);

                // Calculate total
                $total = 0;
                foreach ($validated['items'] as $item) {
                    $total += $item['qty'] * $item['price'];
                }

                $purchaseReturn = PurchaseReturn::create([
                    'return_no' => $returnNo,
                    'supplier_id' => $validated['supplier_id'],
                    'user_id' => auth()->id(),
                    'total' => $total,
                    'note' => $validated['note'],
                ]);

                foreach ($validated['items'] as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                    if ($item['qty'] > $product->stock) {
                        throw ValidationException::withMessages([
                            'items' => ["Cannot return {$item['qty']} of {$product->name}. Current stock is only {$product->stock}."]
                        ]);
                    }

                    $subtotal = $item['qty'] * $item['price'];

                    PurchaseReturnDetail::create([
                        'purchase_return_id' => $purchaseReturn->id,
                        'product_id' => $product->id,
                        'qty' => $item['qty'],
                        'price' => $item['price'],
                        'subtotal' => $subtotal,
                    ]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'type' => 'out',
                        'qty' => $item['qty'],
                        'reference_no' => $purchaseReturn->return_no,
                        'note' => 'Supplier Return',
                    ]);

                    // Subtract product stock
                    $product->decrement('stock', $item['qty']);
                }
            });

            return redirect()->route('supplier-returns.index')->with('success', 'Supplier return recorded successfully.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while recording the return: ' . $e->getMessage());
        }
    }

    public function show(PurchaseReturn $supplierReturn)
    {
        return Inertia::render('SupplierReturns/Show', [
            'purchaseReturn' => $supplierReturn->load(['supplier', 'user', 'details.product']),
        ]);
    }
}
