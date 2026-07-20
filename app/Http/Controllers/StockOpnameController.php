<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockOpname;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    public function index(Request $request)
    {
        $opnames = StockOpname::with(['product', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('StockOpnames/Index', [
            'opnames' => $opnames,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('StockOpnames/Create', [
            'products' => Product::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'physical_qty' => 'required|integer|min:0',
            'note' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
                
                $systemQty = $product->stock;
                $physicalQty = (int) $validated['physical_qty'];
                $difference = $physicalQty - $systemQty;

                $opname = StockOpname::create([
                    'product_id' => $validated['product_id'],
                    'user_id' => auth()->id(),
                    'system_qty' => $systemQty,
                    'physical_qty' => $physicalQty,
                    'difference' => $difference,
                    'note' => $validated['note'],
                ]);

                if ($difference !== 0) {
                    StockMovement::create([
                        'product_id' => $validated['product_id'],
                        'user_id' => auth()->id(),
                        'type' => $difference > 0 ? 'in' : 'out',
                        'qty' => abs($difference),
                        'reference_no' => 'OPNAME-' . $opname->id,
                        'note' => 'Automatic adjustment from Stock Opname #' . $opname->id,
                    ]);

                    $product->update(['stock' => $physicalQty]);
                }
            });

            return redirect()->route('stock-opnames.index')->with('success', 'Stock opname recorded successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while recording the stock opname: ' . $e->getMessage());
        }
    }

    public function show(StockOpname $stockOpname)
    {
        return Inertia::render('StockOpnames/Show', [
            'opname' => $stockOpname->load(['product', 'user']),
        ]);
    }
}
