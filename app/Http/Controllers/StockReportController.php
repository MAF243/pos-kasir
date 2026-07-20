<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');
        
        // Calculate totals on the entire dataset
        $totalAssetValue = Product::sum(DB::raw('stock * purchase_price'));
        $expectedRevenue = Product::sum(DB::raw('stock * selling_price'));

        if ($request->low_stock == '1' || $request->low_stock == 'true') {
            $query->where('stock', '<=', 5);
        }

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $products = $query->paginate(20)->withQueryString();

        return Inertia::render('Reports/Stock', [
            'products' => $products,
            'summary' => [
                'total_asset_value' => (float) $totalAssetValue,
                'expected_revenue' => (float) $expectedRevenue,
                'potential_profit' => (float) ($expectedRevenue - $totalAssetValue),
            ],
            'filters' => [
                'low_stock' => $request->low_stock == '1' || $request->low_stock == 'true',
                'search' => $request->search ?? '',
            ]
        ]);
    }
}
