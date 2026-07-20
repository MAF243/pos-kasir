import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Sales({ dailyData, summary, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);
    const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/sales', { start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout title="Sales Report">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{fmt(summary.total_revenue)}</p>
                </div>
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Transactions</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{new Intl.NumberFormat('id-ID').format(summary.total_transactions)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Daily Sales Breakdown</h3>
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">From</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500" required />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">To</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500" required />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                            Filter
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dailyData.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No sales data found for the selected period.</td></tr>
                            ) : (
                                dailyData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fmtDate(row.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{new Intl.NumberFormat('id-ID').format(row.transactions_count)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700 text-right">{fmt(row.revenue)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {dailyData.length > 0 && (
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">Total</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{new Intl.NumberFormat('id-ID').format(summary.total_transactions)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700 text-right">{fmt(summary.total_revenue)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
