import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';

export default function Stock({ products, summary, filters }) {
    const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);

    const handleFilter = (key, value) => {
        router.get('/reports/stock', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout title="Stock Asset Report">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Asset Value (Cost)</h3>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{fmt(summary.total_asset_value)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Expected Revenue</h3>
                    <p className="mt-2 text-2xl font-bold text-blue-700">{fmt(summary.expected_revenue)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Potential Profit</h3>
                    <p className="mt-2 text-2xl font-bold text-green-700">{fmt(summary.potential_profit)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-64">
                        <SearchInput value={filters.search} placeholder="Search product name..." />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.low_stock}
                            onChange={(e) => handleFilter('low_stock', e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-red-600">Show Low Stock Only (≤ 5)</span>
                    </label>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Value</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.data.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No products match your criteria.</td></tr>
                            ) : (
                                products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                            {product.barcode && <p className="text-xs text-gray-500 font-mono">{product.barcode}</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name ?? '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{fmt(product.stock * product.purchase_price)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{fmt(product.stock * product.selling_price)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={products.links} />
            </div>
        </AdminLayout>
    );
}
