import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';

const STATUS_CONFIG = {
    success: { label: 'Success', classes: 'bg-green-100 text-green-800' },
    pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
    failed:  { label: 'Failed',  classes: 'bg-red-100 text-red-800' },
    void:    { label: 'Void',    classes: 'bg-gray-200 text-gray-700' },
};

const PAYMENT_CONFIG = {
    cash: { label: 'Cash', classes: 'bg-blue-50 text-blue-700' },
    qris: { label: 'QRIS', classes: 'bg-purple-50 text-purple-700' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${cfg.classes}`}>
            {cfg.label}
        </span>
    );
}

function PaymentBadge({ method }) {
    const cfg = PAYMENT_CONFIG[method] ?? { label: method, classes: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.classes}`}>
            {cfg.label}
        </span>
    );
}

export default function Index({ transactions, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value ?? 0);

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        const url = new URL(window.location.href);
        if (e.target.value) {
            url.searchParams.set('status', e.target.value);
        } else {
            url.searchParams.delete('status');
        }
        // Preserve existing search param
        window.location.href = url.toString();
    };

    return (
        <AdminLayout title="Transaction History">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {/* ── Filters Bar ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
                    <div className="flex-1">
                        <SearchInput value={filters.search} placeholder="Search by invoice or cashier name..." />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="block w-full sm:w-44 pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="void">Void</option>
                    </select>
                </div>

                {/* ── Table ── */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Invoice</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.data.map((tx) => (
                                    <tr key={tx.id} className={`hover:bg-gray-50 transition-colors ${tx.status === 'void' ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-bold text-gray-900 font-mono">{tx.invoice_no}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(tx.created_at)}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">{tx.shift?.user?.name ?? '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <PaymentBadge method={tx.payment_method} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <p className={`text-sm font-bold ${tx.status === 'void' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                {formatCurrency(tx.total)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link
                                                href={`/transactions/${tx.id}`}
                                                className="text-sm text-primary-600 hover:text-primary-900 border border-primary-200 px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={transactions.links} />
            </div>
        </AdminLayout>
    );
}
