<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerReturn;
use App\Models\CustomerReturnDetail;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerReturnController extends Controller
{
    public function index(Request $request)
    {
        $returns = CustomerReturn::with(['transaction', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('return_no', 'like', "%{$search}%")
                      ->orWhereHas('transaction', fn($q) => $q->where('invoice_no', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('CustomerReturns/Index', [
            'returns' => $returns,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(Request $request)
    {
        $transaction = Transaction::with('transactionDetails.product')->findOrFail($request->transaction_id);

        // Only allow returns on completed/non-voided transactions
        if (!in_array($transaction->status, ['success', 'pending'])) {
            return redirect()->route('transactions.show', $transaction)
                             ->with('error', 'Returns can only be requested for successful transactions.');
        }

        return Inertia::render('CustomerReturns/Create', [
            'transaction' => $transaction,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.transaction_detail_id' => 'required|exists:transaction_details,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $transaction = Transaction::with('transactionDetails')->findOrFail($validated['transaction_id']);

        // Validate qty against original purchase
        foreach ($validated['items'] as $item) {
            $detail = TransactionDetail::findOrFail($item['transaction_detail_id']);
            if ($item['qty'] > $detail->qty) {
                return back()->withErrors(['items' => "Return qty for product ID {$item['product_id']} cannot exceed the purchased qty ({$detail->qty})."]);
            }
        }

        $total = array_reduce($validated['items'], fn($carry, $item) => $carry + ($item['qty'] * $item['price']), 0);

        $datePrefix = date('Ymd');
        $last = CustomerReturn::whereDate('created_at', today())->latest('id')->first();
        $counter = $last ? ((int) substr($last->return_no, -4)) + 1 : 1;
        $returnNo = 'CRET-' . $datePrefix . '-' . str_pad($counter, 4, '0', STR_PAD_LEFT);

        $customerReturn = CustomerReturn::create([
            'return_no' => $returnNo,
            'transaction_id' => $validated['transaction_id'],
            'user_id' => auth()->id(),
            'total_refund' => $total,
            'status' => 'pending',
            'note' => $validated['note'],
        ]);

        foreach ($validated['items'] as $item) {
            CustomerReturnDetail::create([
                'customer_return_id' => $customerReturn->id,
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'price' => $item['price'],
                'subtotal' => $item['qty'] * $item['price'],
            ]);
        }

        return redirect()->route('customer-returns.show', $customerReturn)
                         ->with('success', "Return request {$returnNo} submitted successfully. Awaiting approval.");
    }

    public function show(CustomerReturn $customerReturn)
    {
        return Inertia::render('CustomerReturns/Show', [
            'customerReturn' => $customerReturn->load(['transaction.shift.user', 'user', 'details.product']),
            'canManage' => auth()->user()->hasPermissionTo('manage_returns'),
        ]);
    }

    public function approve(CustomerReturn $customerReturn)
    {
        if ($customerReturn->status !== 'pending') {
            return back()->with('error', 'This return is no longer pending and cannot be approved.');
        }

        DB::transaction(function () use ($customerReturn) {
            $customerReturn->update(['status' => 'approved']);

            $details = $customerReturn->details()->orderBy('product_id')->get();
            foreach ($details as $detail) {
                $product = Product::lockForUpdate()->findOrFail($detail->product_id);

                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'qty' => $detail->qty,
                    'reference_no' => $customerReturn->return_no,
                    'note' => 'Customer Return Approved',
                ]);

                $product->increment('stock', $detail->qty);
            }
        });

        return redirect()->route('customer-returns.show', $customerReturn)
                         ->with('success', "Return {$customerReturn->return_no} approved. Stock has been restored.");
    }

    public function reject(CustomerReturn $customerReturn)
    {
        if ($customerReturn->status !== 'pending') {
            return back()->with('error', 'This return is no longer pending and cannot be rejected.');
        }

        $customerReturn->update(['status' => 'rejected']);

        return redirect()->route('customer-returns.show', $customerReturn)
                         ->with('success', "Return {$customerReturn->return_no} has been rejected.");
    }
}
