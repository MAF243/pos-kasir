import { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create({ suppliers, products }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        note: '',
        items: [],
    });

    const [selectedProductId, setSelectedProductId] = useState('');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const addProduct = () => {
        if (!selectedProductId) return;
        
        // Check if already in list
        if (data.items.some(item => item.product_id === parseInt(selectedProductId))) {
            alert('Product is already in the return list.');
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProductId));
        if (product) {
            setData('items', [
                ...data.items, 
                { 
                    product_id: product.id, 
                    name: product.name,
                    qty: 1, 
                    price: product.purchase_price, // Default to last purchase price
                    max_stock: product.stock
                }
            ]);
            setSelectedProductId('');
        }
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const grandTotal = useMemo(() => {
        return data.items.reduce((total, item) => total + (Number(item.qty) * Number(item.price)), 0);
    }, [data.items]);

    const submit = (e) => {
        e.preventDefault();
        
        // Front-end validation before submitting
        const hasStockError = data.items.some(item => Number(item.qty) > Number(item.max_stock));
        if (hasStockError) {
            alert('Cannot proceed: One or more products have a return quantity greater than their current available stock!');
            return;
        }

        post('/supplier-returns');
    };

    return (
        <AdminLayout title="New Supplier Return">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl">
                <form onSubmit={submit}>
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Supplier <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors.supplier_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} sm:text-sm rounded-md bg-white`}
                                    value={data.supplier_id}
                                    onChange={e => setData('supplier_id', e.target.value)}
                                >
                                    <option value="" disabled>Select Supplier...</option>
                                    {suppliers.map(sup => (
                                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                                    ))}
                                </select>
                                {errors.supplier_id && <p className="mt-2 text-sm text-red-600">{errors.supplier_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Return Note</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={data.note}
                                    onChange={e => setData('note', e.target.value)}
                                    placeholder="Reason for return (e.g., Defective items)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Select Product to Return</label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white"
                                value={selectedProductId}
                                onChange={e => setSelectedProductId(e.target.value)}
                            >
                                <option value="" disabled>Search and select product in stock...</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id} disabled={product.stock <= 0}>
                                        {product.name} (Available Stock: {product.stock})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={addProduct}
                            disabled={!selectedProductId}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 disabled:opacity-50"
                        >
                            Add to Return List
                        </button>
                    </div>

                    <div className="p-0 overflow-x-auto">
                        {errors.items && <p className="p-4 text-sm text-red-600 bg-red-50">{errors.items}</p>}
                        
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Product</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Return Qty</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Return Value (IDR)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Subtotal</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.items.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 italic">No products added yet. Please select from the dropdown above.</td>
                                    </tr>
                                ) : (
                                    data.items.map((item, index) => {
                                        const isOverStock = Number(item.qty) > Number(item.max_stock);
                                        return (
                                        <tr key={item.product_id} className={isOverStock ? 'bg-red-50' : ''}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-500">Max Available: {item.max_stock}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    max={item.max_stock}
                                                    className={`block w-full text-right px-3 py-2 border rounded-md shadow-sm sm:text-sm ${isOverStock ? 'border-red-500 focus:ring-red-500 text-red-700' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
                                                    value={item.qty}
                                                    onChange={e => updateItem(index, 'qty', e.target.value)}
                                                />
                                                {isOverStock && (
                                                    <p className="mt-1 text-xs text-red-600 flex items-center">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                        Exceeds Stock!
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    className="block w-full text-right px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    value={item.price}
                                                    onChange={e => updateItem(index, 'price', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(Number(item.qty) * Number(item.price))}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-widest">Total Return Value</td>
                                    <td className="px-6 py-4 text-right text-xl font-bold text-danger-700">{formatCurrency(grandTotal)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                        <Link href="/supplier-returns" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || data.items.length === 0}
                            className="inline-flex justify-center px-6 py-2 text-base font-bold text-white bg-danger-600 border border-transparent rounded-md shadow-sm hover:bg-danger-700 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Confirm Return'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
