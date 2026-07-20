<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $movements = StockMovement::with(['product', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('reference_no', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('StockMovements/Index', [
            'movements' => $movements,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('StockMovements/Create', [
            'products' => Product::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out',
            'qty' => 'required|integer|min:1',
            'reference_no' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

                if ($validated['type'] === 'out' && $product->stock < $validated['qty']) {
                    throw ValidationException::withMessages([
                        'qty' => ['The quantity exceeds the current stock available (' . $product->stock . ').']
                    ]);
                }

                StockMovement::create([
                    'product_id' => $validated['product_id'],
                    'user_id' => auth()->id(),
                    'type' => $validated['type'],
                    'qty' => $validated['qty'],
                    'reference_no' => $validated['reference_no'],
                    'note' => $validated['note'],
                ]);

                if ($validated['type'] === 'in') {
                    $product->increment('stock', $validated['qty']);
                } else {
                    $product->decrement('stock', $validated['qty']);
                }
            });

            return redirect()->route('stock-movements.index')->with('success', 'Stock movement recorded successfully.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while recording the stock movement: ' . $e->getMessage());
        }
    }
}
