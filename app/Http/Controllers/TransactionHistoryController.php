<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionHistoryController extends Controller
{
    public function index(Request $request)
    {
        $transactions = Transaction::with(['shift.user', 'customer'])
            ->when($request->search, function ($query, $search) {
                $query->where('invoice_no', 'like', "%{$search}%")
                      ->orWhereHas('shift.user', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load([
            'transactionDetails.product',
            'shift.user',
            'customer',
            'activeReturns',
        ]);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
            'canVoid' => auth()->user()->hasPermissionTo('void_transaction'),
            'canReturn' => auth()->user()->hasPermissionTo('manage_returns'),
            'hasActiveReturn' => $transaction->activeReturns->isNotEmpty(),
        ]);
    }

    public function void(Transaction $transaction)
    {
        // Prevent voiding already-finalized statuses
        if (in_array($transaction->status, ['void', 'failed'])) {
            return back()->with('error', 'This transaction has already been voided or failed and cannot be voided again.');
        }

        DB::transaction(function () use ($transaction) {
            $transaction->update(['status' => 'void']);

            $details = TransactionDetail::where('transaction_id', $transaction->id)->orderBy('product_id')->get();

            foreach ($details as $detail) {
                $product = Product::lockForUpdate()->findOrFail($detail->product_id);

                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'qty' => $detail->qty,
                    'reference_no' => $transaction->invoice_no,
                    'note' => 'Voided POS Transaction',
                ]);

                $product->increment('stock', $detail->qty);
            }
        });

        return redirect()->route('transactions.index')
                         ->with('success', "Transaction {$transaction->invoice_no} has been voided and stock has been restored.");
    }
}
