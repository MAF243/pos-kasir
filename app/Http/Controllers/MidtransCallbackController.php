<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Config as MidtransConfig;
use Midtrans\Notification;

class MidtransCallbackController extends Controller
{
    public function handle(Request $request)
    {
        // Configure Midtrans
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');

        try {
            $notification = new Notification();

            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $paymentType = $notification->payment_type;
            $fraudStatus = $notification->fraud_status ?? 'accept';

            Log::info('Midtrans webhook received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'payment_type' => $paymentType,
                'fraud_status' => $fraudStatus,
            ]);

            $transaction = Transaction::where('invoice_no', $orderId)->first();

            if (!$transaction) {
                Log::warning('Midtrans webhook: Transaction not found', ['order_id' => $orderId]);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Idempotency — skip if already finalized
            if (in_array($transaction->status, ['success', 'failed'])) {
                return response()->json(['message' => 'Already processed'], 200);
            }

            // ── Determine new status ──────────────────────────────────────────
            $isCaptured = $transactionStatus === 'capture' && $fraudStatus === 'accept';
            $isSettled  = $transactionStatus === 'settlement';
            $isFailed   = in_array($transactionStatus, ['expire', 'cancel', 'deny']);

            if ($isCaptured || $isSettled) {
                $transaction->update(['status' => 'success']);
                Log::info("Transaction {$orderId} marked success.");
            } elseif ($isFailed) {
                // ── Wrap stock reversal in a DB transaction ───────────────────
                DB::transaction(function () use ($transaction, $transactionStatus) {
                    $transaction->update(['status' => 'failed']);

                    // Restore stock for each item in the order
                    $details = TransactionDetail::where('transaction_id', $transaction->id)
                        ->with('product')
                        ->get();

                    foreach ($details as $detail) {
                        $product = Product::lockForUpdate()->findOrFail($detail->product_id);

                        StockMovement::create([
                            'product_id' => $product->id,
                            'user_id' => $transaction->shift?->user_id ?? 1,
                            'type' => 'in',
                            'qty' => $detail->qty,
                            'reference_no' => $transaction->invoice_no,
                            'note' => 'Reverted: Digital Payment ' . ucfirst($transactionStatus),
                        ]);

                        $product->increment('stock', $detail->qty);
                    }
                });

                Log::info("Transaction {$orderId} failed — stock reverted.");
            }

            return response()->json(['message' => 'Notification processed successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Midtrans webhook error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
