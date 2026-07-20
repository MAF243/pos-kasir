import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const STATUS_CONFIG = {
    pending:  { label: 'Pending Approval', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    approved: { label: 'Approved',         classes: 'bg-green-100 text-green-800 border-green-300' },
    rejected: { label: 'Rejected',         classes: 'bg-red-100 text-red-800 border-red-300' },
};

export default function Show({ customerReturn, canManage }) {
    const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);
    const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    const status = STATUS_CONFIG[customerReturn.status] ?? { label: customerReturn.status, classes: 'bg-gray-100 text-gray-600 border-gray-200' };
    const isPending = customerReturn.status === 'pending';

    const handleApprove = () => {
        if (!confirm(`Approve return ${customerReturn.return_no}? This will restore all listed items to stock.`)) return;
        router.post(`/customer-returns/${customerReturn.id}/approve`);
    };

    const handleReject = () => {
        if (!confirm(`Reject return ${customerReturn.return_no}? No stock changes will be made.`)) return;
        router.post(`/customer-returns/${customerReturn.id}/reject`);
    };

    return (
        <AdminLayout title={`Return ${customerReturn.return_no}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">

                {/* Header */}
                <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900 font-mono">{customerReturn.return_no}</h3>
                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${status.classes}`}>
                                {status.label}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{fmtDate(customerReturn.created_at)}</p>
                    </div>
                    <div className="flex gap-3 shrink-0 flex-wrap">
                        <Link href="/customer-returns" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">← Back</Link>
                        {canManage && isPending && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    Approve & Restock
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-danger-600 rounded-lg hover:bg-danger-700 shadow-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original Invoice</dt>
                            <dd className="mt-1">
                                <Link href={`/transactions/${customerReturn.transaction_id}`} className="text-sm font-bold text-primary-600 hover:underline font-mono">
                                    {customerReturn.transaction?.invoice_no}
                                </Link>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted By</dt>
                            <dd className="mt-1 text-sm text-gray-900">{customerReturn.user?.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reason / Note</dt>
                            <dd className="mt-1 text-sm text-gray-600 italic">{customerReturn.note || 'No reason provided.'}</dd>
                        </div>
                    </dl>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Returned</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal Refund</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customerReturn.details?.map((detail) => (
                                <tr key={detail.id}>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{detail.product?.name ?? '(deleted)'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">{fmt(detail.price)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{detail.qty}</td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{fmt(detail.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-widest">Total Refund</td>
                                <td className={`px-6 py-4 text-right text-xl font-bold ${customerReturn.status === 'approved' ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {fmt(customerReturn.total_refund)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
