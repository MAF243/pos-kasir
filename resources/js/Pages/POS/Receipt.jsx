import { Head, Link, usePage } from '@inertiajs/react';

const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value ?? 0);

const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export default function Receipt({ transaction }) {
    const { store_setting } = usePage().props;
    const handlePrint = () => window.print();
    const details = transaction.transaction_details ?? [];

    return (
        <>
            <Head title={`Receipt — ${transaction.invoice_no}`} />

            {/* ── Screen controls (hidden on print) ── */}
            <div className="print:hidden min-h-screen bg-gray-100 flex flex-col items-center justify-start py-8 gap-4">
                <div className="flex gap-3">
                    <Link
                        href="/pos"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        New Transaction
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Receipt
                    </button>
                </div>

                {/* Receipt preview card */}
                <div className="bg-white shadow-2xl rounded-xl overflow-hidden" style={{ width: '320px' }}>
                    <ReceiptContent transaction={transaction} details={details} store_setting={store_setting} />
                </div>
            </div>

            {/* ── Actual print area (only this shows when printing) ── */}
            <div className="hidden print:block">
                <ReceiptContent transaction={transaction} details={details} store_setting={store_setting} />
            </div>

            <style>{`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 4mm;
                    }
                    html, body {
                        width: 80mm;
                        font-size: 11px;
                    }
                }
            `}</style>
        </>
    );
}

function ReceiptContent({ transaction, details, store_setting }) {
    const formatCurrency = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value ?? 0);

    return (
        <div className="p-4 font-mono text-xs text-gray-900" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
                <p className="text-base font-extrabold uppercase tracking-widest">{store_setting?.name || 'POS Kasir'}</p>
                {store_setting?.address && <p className="text-xs text-gray-600 whitespace-pre-wrap mt-1">{store_setting.address}</p>}
                {store_setting?.phone && <p className="text-xs text-gray-600 mt-0.5">{store_setting.phone}</p>}
            </div>

            {/* Transaction Info */}
            <div className="border-b border-dashed border-gray-400 pb-3 mb-3 space-y-0.5">
                <div className="flex justify-between">
                    <span className="text-gray-500">Invoice</span>
                    <span className="font-bold">{transaction.invoice_no}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="text-right">{new Date(transaction.created_at).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Cashier</span>
                    <span>{transaction.shift?.user?.name ?? '-'}</span>
                </div>
                {transaction.customer && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Customer</span>
                        <span>{transaction.customer.name}</span>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
                <p className="text-center text-xs font-bold uppercase text-gray-500 mb-2">Items</p>
                {details.map((detail, i) => (
                    <div key={i} className="mb-1.5">
                        <p className="font-semibold truncate">{detail.product?.name}</p>
                        <div className="flex justify-between text-gray-600">
                            <span>{detail.qty} x {formatCurrency(detail.price)}</span>
                            <span className="font-bold text-gray-900">{formatCurrency(detail.subtotal)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-b border-dashed border-gray-400 pb-3 mb-3 space-y-0.5">
                <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(transaction.subtotal)}</span>
                </div>
                {transaction.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(transaction.discount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-1">
                    <span>TOTAL</span>
                    <span>{formatCurrency(transaction.total)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Payment</span>
                    <span className="uppercase font-semibold">{transaction.payment_method}</span>
                </div>
                {transaction.payment_method === 'cash' && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Cash</span>
                            <span>{formatCurrency(transaction.pay)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Change</span>
                            <span className="font-bold">{formatCurrency(transaction.change)}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 whitespace-pre-wrap">
                    {store_setting?.receipt_footer || 'Thank You!\nPlease come again'}
                </p>
                <p className="text-xs text-gray-300 mt-2">— {transaction.invoice_no} —</p>
            </div>
        </div>
    );
}
