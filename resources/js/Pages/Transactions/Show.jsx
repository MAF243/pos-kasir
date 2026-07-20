import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import DeleteModal from '../../Components/DeleteModal';

const STATUS_CONFIG = {
    success: { label: 'Success',  classes: 'bg-green-100 text-green-800 border-green-200' },
    pending: { label: 'Pending',  classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    failed:  { label: 'Failed',   classes: 'bg-red-100 text-red-800 border-red-200' },
    void:    { label: 'Voided',   classes: 'bg-gray-200 text-gray-700 border-gray-300' },
};

export default function Show({ transaction, canVoid, canReturn, hasActiveReturn }) {
    const [voidModalOpen, setVoidModalOpen] = useState(false);
    const [isVoiding, setIsVoiding] = useState(false);

    const details = transaction.transaction_details ?? [];

    const formatCurrency = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value ?? 0);

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    const status = STATUS_CONFIG[transaction.status] ?? { label: transaction.status, classes: 'bg-gray-100 text-gray-600 border-gray-200' };
    const canBeVoided = canVoid && ['success', 'pending'].includes(transaction.status) && !hasActiveReturn;
    const canRequestReturn = canReturn && transaction.status === 'success';

    const handleVoidConfirm = () => {
        setIsVoiding(true);
        router.post(`/transactions/${transaction.id}/void`, {}, {
            onSuccess: () => { setVoidModalOpen(false); setIsVoiding(false); },
            onError: () => setIsVoiding(false),
        });
    };

    return (
        <AdminLayout title={`Transaction ${transaction.invoice_no}`}>
            {/* ── Void Confirmation Modal ── */}
            <DeleteModal
                isOpen={voidModalOpen}
                onClose={() => setVoidModalOpen(false)}
                onConfirm={handleVoidConfirm}
                title="Void This Transaction?"
                message={`Are you sure you want to void invoice ${transaction.invoice_no}? This action will cancel the sale and return all ${details.length} item(s) back to stock. This cannot be undone.`}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">

                {/* ── Header ── */}
                <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900 font-mono">{transaction.invoice_no}</h3>
                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${status.classes}`}>
                                {status.label}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{formatDateTime(transaction.created_at)}</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <Link href="/transactions" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            ← Back
                        </Link>
                        <Link href={`/pos/receipt/${transaction.id}`} target="_blank" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            🖨 Print Receipt
                        </Link>
                        {canRequestReturn && (
                            <Link
                                href={`/customer-returns/create?transaction_id=${transaction.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-yellow-500 border border-transparent rounded-lg shadow-sm hover:bg-yellow-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                Request Return
                            </Link>
                        )}
                        {canVoid && hasActiveReturn && ['success', 'pending'].includes(transaction.status) && (
                            <div className="relative group">
                                <button disabled className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gray-400 border border-transparent rounded-lg shadow-sm cursor-not-allowed opacity-70">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                    Void Blocked
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-56 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Cannot void: this transaction has an active or approved return.
                                </div>
                            </div>
                        )}
                        {canBeVoided && (
                            <button
                                onClick={() => setVoidModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-danger-600 border border-transparent rounded-lg shadow-sm hover:bg-danger-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Void Transaction
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Voided Banner ── */}
                {transaction.status === 'void' && (
                    <div className="px-6 py-3 bg-gray-100 border-b border-gray-200 flex items-center gap-3 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        This transaction has been <strong>voided</strong>. All stock has been restored to inventory.
                    </div>
                )}

                {/* ── Info Grid ── */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cashier</dt>
                            <dd className="mt-1 text-sm font-semibold text-gray-900">{transaction.shift?.user?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</dt>
                            <dd className="mt-1 text-sm text-gray-900">{transaction.customer?.name ?? 'Walk-in'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment</dt>
                            <dd className="mt-1 text-sm font-semibold text-gray-900 uppercase">{transaction.payment_method}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shift</dt>
                            <dd className="mt-1 text-sm text-gray-900">#{transaction.shift_id}</dd>
                        </div>
                    </dl>
                </div>

                {/* ── Items Table ── */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {details.map((detail) => (
                                <tr key={detail.id} className={transaction.status === 'void' ? 'opacity-50' : ''}>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{detail.product?.name ?? '(deleted product)'}</p>
                                        {detail.product?.barcode && (
                                            <p className="text-xs text-gray-400 font-mono">{detail.product.barcode}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">{formatCurrency(detail.price)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{detail.qty}</td>
                                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(detail.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                            {transaction.discount > 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-3 text-right text-sm text-gray-500">Subtotal</td>
                                    <td className="px-6 py-3 text-right text-sm text-gray-900">{formatCurrency(transaction.subtotal)}</td>
                                </tr>
                            )}
                            {transaction.discount > 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-2 text-right text-sm text-red-500">Discount</td>
                                    <td className="px-6 py-2 text-right text-sm text-red-600">−{formatCurrency(transaction.discount)}</td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-widest">Grand Total</td>
                                <td className={`px-6 py-4 text-right text-xl font-bold ${transaction.status === 'void' ? 'line-through text-gray-400' : 'text-primary-700'}`}>
                                    {formatCurrency(transaction.total)}
                                </td>
                            </tr>
                            {transaction.payment_method === 'cash' && (
                                <>
                                    <tr>
                                        <td colSpan="3" className="px-6 py-2 text-right text-sm text-gray-500">Cash Received</td>
                                        <td className="px-6 py-2 text-right text-sm text-gray-700">{formatCurrency(transaction.pay)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-6 py-2 text-right text-sm text-gray-500">Change (Kembalian)</td>
                                        <td className="px-6 py-2 text-right text-sm font-semibold text-green-700">{formatCurrency(transaction.change)}</td>
                                    </tr>
                                </>
                            )}
                        </tfoot>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
