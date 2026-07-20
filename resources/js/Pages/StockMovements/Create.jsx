import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create({ products }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        type: 'in',
        qty: 1,
        reference_no: '',
        note: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/stock-movements');
    };

    // Find selected product to show current stock
    const selectedProduct = products.find(p => p.id === parseInt(data.product_id));

    return (
        <AdminLayout title="Record Stock Movement">
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
                                <option value="" disabled>Select a product...</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (Stock: {product.stock})
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && <p className="mt-2 text-sm text-red-600">{errors.product_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Movement Type <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors.type ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} sm:text-sm rounded-md bg-white`}
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                >
                                    <option value="in">Stock IN (Add)</option>
                                    <option value="out">Stock OUT (Subtract)</option>
                                </select>
                                {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className={`mt-1 block w-full px-3 py-2 border ${errors.qty ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm font-bold text-lg text-center`}
                                    value={data.qty}
                                    onChange={e => setData('qty', e.target.value)}
                                />
                                {errors.qty && <p className="mt-2 text-sm text-red-600">{errors.qty}</p>}
                            </div>
                        </div>

                        {/* Current Stock Preview */}
                        {selectedProduct && (
                            <div className={`p-4 rounded-lg border flex justify-between items-center ${data.type === 'in' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div>
                                    <span className="text-sm text-gray-600">Current Stock</span>
                                    <div className="font-bold text-lg">{selectedProduct.stock}</div>
                                </div>
                                <div className="text-gray-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-600">Projected Stock</span>
                                    <div className={`font-bold text-2xl ${data.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                                        {data.type === 'in' ? selectedProduct.stock + Number(data.qty || 0) : selectedProduct.stock - Number(data.qty || 0)}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reference Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.reference_no ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm font-mono`}
                                value={data.reference_no}
                                onChange={e => setData('reference_no', e.target.value)}
                                placeholder="e.g. PO-2023-001"
                            />
                            {errors.reference_no && <p className="mt-2 text-sm text-red-600">{errors.reference_no}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Note <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <textarea
                                rows={3}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.note ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.note}
                                onChange={e => setData('note', e.target.value)}
                                placeholder="Reason for stock movement..."
                            />
                            {errors.note && <p className="mt-2 text-sm text-red-600">{errors.note}</p>}
                        </div>

                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Link href="/stock-movements" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || (data.type === 'out' && selectedProduct && (selectedProduct.stock - Number(data.qty || 0) < 0))}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Record Movement'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
