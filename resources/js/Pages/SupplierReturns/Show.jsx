import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Show({ purchaseReturn }) {
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <AdminLayout title={`Supplier Return #${purchaseReturn.return_no}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-xl leading-6 font-bold text-gray-900">{purchaseReturn.return_no}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Recorded on {formatDate(purchaseReturn.created_at)}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/supplier-returns" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Back to List
                        </Link>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-bold">{purchaseReturn.supplier?.name}</dd>
                            <dd className="mt-1 text-xs text-gray-500">{purchaseReturn.supplier?.phone || '-'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Recorded By</dt>
                            <dd className="mt-1 text-sm text-gray-900">{purchaseReturn.user?.name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Return Note</dt>
                            <dd className="mt-1 text-sm text-gray-900 italic">
                                {purchaseReturn.note || 'No notes provided.'}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Details Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Returned</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Value</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {purchaseReturn.details.map((detail) => (
                                <tr key={detail.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{detail.product?.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">Barcode: {detail.product?.barcode || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                        {detail.qty}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        {formatCurrency(detail.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        {formatCurrency(detail.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                            <tr>
                                <th colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-widest">
                                    Total Return Value
                                </th>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-xl font-bold text-danger-700">
                                    {formatCurrency(purchaseReturn.total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
