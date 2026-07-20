import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Show({ opname }) {
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <AdminLayout title={`Stock Opname Details #${opname.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl">
                
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Opname Record</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Recorded on {formatDate(opname.created_at)}</p>
                    </div>
                    <Link href="/stock-opnames" className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        Back to List
                    </Link>
                </div>

                <div className="px-6 py-5">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Product</dt>
                            <dd className="mt-1 flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    {opname.product?.image_url ? (
                                        <img className="h-12 w-12 object-cover" src={opname.product.image_url} alt="" />
                                    ) : (
                                        <svg className="h-12 w-12 text-gray-300 p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="text-base font-medium text-gray-900">{opname.product?.name}</div>
                                    <div className="text-sm text-gray-500 font-mono">Barcode: {opname.product?.barcode || '-'}</div>
                                </div>
                            </dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Auditor / User</dt>
                            <dd className="mt-1 text-sm text-gray-900">{opname.user?.name}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm">
                                {opname.difference === 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Matched</span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Adjusted</span>
                                )}
                            </dd>
                        </div>

                        <div className="sm:col-span-2 border-t border-gray-200 pt-5 mt-2">
                            <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Stock Variance Analysis</h4>
                            
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <dt className="text-sm font-medium text-gray-500">System Qty</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{opname.system_qty}</dd>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border-2 border-primary-100 shadow-sm">
                                    <dt className="text-sm font-medium text-primary-600">Physical Qty</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-primary-700">{opname.physical_qty}</dd>
                                </div>
                                
                                <div className={`p-4 rounded-lg border ${opname.difference > 0 ? 'bg-emerald-50 border-emerald-100' : opname.difference < 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <dt className={`text-sm font-medium ${opname.difference > 0 ? 'text-emerald-700' : opname.difference < 0 ? 'text-red-700' : 'text-gray-500'}`}>Difference</dt>
                                    <dd className={`mt-1 text-3xl font-semibold ${opname.difference > 0 ? 'text-emerald-600' : opname.difference < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {opname.difference > 0 ? `+${opname.difference}` : opname.difference}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2 border-t border-gray-200 pt-5 mt-2">
                            <dt className="text-sm font-medium text-gray-500">Auditor Notes</dt>
                            <dd className="mt-1 text-sm text-gray-900 bg-yellow-50 p-4 rounded-md border border-yellow-100 italic">
                                {opname.note || "No notes provided."}
                            </dd>
                        </div>

                    </dl>
                </div>
            </div>
        </AdminLayout>
    );
}
