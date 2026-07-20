import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Profit({ summary, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/reports/profit', { start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout title="Profitability Report">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Period Filter</h3>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gross Revenue</h3>
                    <p className="mt-2 text-2xl font-bold text-green-700">{fmt(summary.gross_revenue)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cost of Goods Sold (COGS)</h3>
                    <p className="mt-2 text-2xl font-bold text-red-700">{fmt(summary.cogs)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gross Profit</h3>
                    <p className="mt-2 text-2xl font-bold text-blue-700">{fmt(summary.gross_profit)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Expenses</h3>
                    <p className="mt-2 text-2xl font-bold text-red-700">{fmt(summary.total_expenses)}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-2 bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-500 rounded-full opacity-20 blur-2xl"></div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Net Profit</h3>
                        <p className={`mt-2 text-4xl font-bold ${summary.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {fmt(summary.net_profit)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Profitability Breakdown</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Gross Revenue (Sales)</span>
                            <span className="font-bold text-green-700">{fmt(summary.gross_revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Cost of Goods Sold (COGS)</span>
                            <span className="font-bold text-red-700">− {fmt(summary.cogs)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600 font-semibold">Gross Profit</span>
                            <span className="font-bold text-blue-700">{fmt(summary.gross_profit)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Operational Expenses</span>
                            <span className="font-bold text-red-700">− {fmt(summary.total_expenses)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
                            <span className="text-gray-900 font-bold uppercase tracking-wider">Net Profit</span>
                            <span className={`text-xl font-bold ${summary.net_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {fmt(summary.net_profit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
