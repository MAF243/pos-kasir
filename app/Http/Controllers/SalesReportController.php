<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Inertia\Inertia;
use Carbon\Carbon;

class SalesReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::now()->endOfMonth();

        $transactions = Transaction::where('status', 'success')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $totalRevenue = $transactions->sum('total');
        $totalTransactions = $transactions->count();

        // Group by date
        $dailyData = $transactions->groupBy(function($tx) {
            return Carbon::parse($tx->created_at)->format('Y-m-d');
        })->map(function ($row, $date) {
            return [
                'date' => $date,
                'revenue' => $row->sum('total'),
                'transactions_count' => $row->count(),
            ];
        })->values()->sortByDesc('date')->values();

        return Inertia::render('Reports/Sales', [
            'dailyData' => $dailyData,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
