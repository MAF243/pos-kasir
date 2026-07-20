<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Expense;
use Inertia\Inertia;
use Carbon\Carbon;

class ProfitReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::now()->endOfMonth();

        $transactions = Transaction::with('transactionDetails.product')
            ->where('status', 'success')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $grossRevenue = $transactions->sum('total');
        
        $cogs = 0;
        foreach ($transactions as $transaction) {
            foreach ($transaction->transactionDetails as $detail) {
                // If product is deleted, cogs might not accurately reflect if we didn't save purchase_price historically,
                // but for now relying on current product purchase price is fine.
                $cogs += $detail->qty * ($detail->product->purchase_price ?? 0);
            }
        }

        $totalExpenses = Expense::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])->sum('amount');
        
        $netProfit = $grossRevenue - $cogs - $totalExpenses;

        return Inertia::render('Reports/Profit', [
            'summary' => [
                'gross_revenue' => $grossRevenue,
                'cogs' => $cogs,
                'gross_profit' => $grossRevenue - $cogs,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
