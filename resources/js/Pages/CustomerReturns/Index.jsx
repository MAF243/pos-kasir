import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';

const STATUS_CONFIG = {
    pending:  { label: 'Pending',  classes: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', classes: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-800' },
};

export default function Index({ returns, filters }) {
    const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);
    const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <AdminLayout title="Customer Returns">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <SearchInput value={filters.search} placeholder="Search by return no. or invoice..." />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Return No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Invoice</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Refund</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {returns.data.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">No returns found.</td></tr>
                            ) : (
                                returns.data.map((ret) => {
                                    const cfg = STATUS_CONFIG[ret.status] ?? { label: ret.status, classes: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-gray-900 font-mono">{ret.return_no}</p>
                                                <p className="text-xs text-gray-500">{fmtDate(ret.created_at)}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-900 font-mono">{ret.transaction?.invoice_no}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-900">{ret.user?.name}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{fmt(ret.total_refund)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${cfg.classes}`}>{cfg.label}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link href={`/customer-returns/${ret.id}`} className="text-sm text-primary-600 hover:text-primary-900 border border-primary-200 px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={returns.links} />
            </div>
        </AdminLayout>
    );
}
