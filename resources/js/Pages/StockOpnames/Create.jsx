import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create({ products }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        physical_qty: '',
        note: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/stock-opnames');
    };

    // Find selected product to show current stock
    const selectedProduct = products.find(p => p.id === parseInt(data.product_id));

    return (
        <AdminLayout title="Perform Stock Opname">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                <form onSubmit={submit}>
                    <div className="p-6 space-y-6">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product <span className="text-red-500">*</span></label>
                            <select
                                required
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors.product_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} sm:text-sm rounded-md bg-white`}
                                value={data.product_id}
                                onChange={e => setData('product_id', e.target.value)}
                            >
                                <option value="" disabled>Select a product to scan...</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (Current System Stock: {product.stock})
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && <p className="mt-2 text-sm text-red-600">{errors.product_id}</p>}
                        </div>

                        {/* Visual Aid */}
                        {selectedProduct && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-blue-800 font-medium">System expects to find:</p>
                                </div>
                                <div className="text-2xl font-bold text-blue-900">
                                    {selectedProduct.stock} <span className="text-sm font-normal">units</span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Actual Physical Quantity <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="0"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.physical_qty ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm font-bold text-xl text-center`}
                                value={data.physical_qty}
                                onChange={e => setData('physical_qty', e.target.value)}
                                placeholder="Enter actual count"
                            />
                            {errors.physical_qty && <p className="mt-2 text-sm text-red-600">{errors.physical_qty}</p>}
                        </div>

                        {/* Variance Preview */}
                        {selectedProduct && data.physical_qty !== '' && (
                            <div className="mt-2">
                                {Number(data.physical_qty) - selectedProduct.stock > 0 ? (
                                    <p className="text-sm text-emerald-600 font-medium flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                        Variance: +{Number(data.physical_qty) - selectedProduct.stock} (Surplus found)
                                    </p>
                                ) : Number(data.physical_qty) - selectedProduct.stock < 0 ? (
                                    <p className="text-sm text-red-600 font-medium flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                        Variance: {Number(data.physical_qty) - selectedProduct.stock} (Stock missing)
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500 font-medium flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Perfect Match! No variance.
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Note <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <textarea
                                rows={3}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.note ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.note}
                                onChange={e => setData('note', e.target.value)}
                                placeholder="Any comments regarding discrepancies..."
                            />
                            {errors.note && <p className="mt-2 text-sm text-red-600">{errors.note}</p>}
                        </div>

                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Link href="/stock-opnames" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Record Opname'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
