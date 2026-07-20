import { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create({ transaction }) {
    const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);

    // Build initial items — one row per original transaction detail
    const [items, setItems] = useState(
        (transaction.transaction_details ?? []).map(detail => ({
            transaction_detail_id: detail.id,
            product_id: detail.product_id,
            name: detail.product?.name ?? '(unknown)',
            max_qty: detail.qty,
            price: detail.price,
            return_qty: 0,
            include: false,
        }))
    );

    const { data, setData, post, processing, errors } = useForm({
        transaction_id: transaction.id,
        note: '',
        items: [],
    });

    const toggleItem = (index) => {
        const updated = [...items];
        updated[index].include = !updated[index].include;
        if (!updated[index].include) updated[index].return_qty = 0;
        setItems(updated);
    };

    const updateQty = (index, value) => {
        const updated = [...items];
        const parsed = Math.max(0, Math.min(parseInt(value) || 0, updated[index].max_qty));
        updated[index].return_qty = parsed;
        setItems(updated);
    };

    const totalRefund = useMemo(() =>
        items.filter(i => i.include && i.return_qty > 0)
             .reduce((s, i) => s + i.return_qty * i.price, 0),
        [items]
    );

    const selectedItems = items.filter(i => i.include && i.return_qty > 0);

    const submit = (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            alert('Please select at least one item to return with a quantity greater than 0.');
            return;
        }
        post('/customer-returns', {
            data: {
                transaction_id: data.transaction_id,
                note: data.note,
                items: selectedItems.map(i => ({
                    transaction_detail_id: i.transaction_detail_id,
                    product_id: i.product_id,
                    qty: i.return_qty,
                    price: i.price,
                })),
            },
        });
    };

    return (
        <AdminLayout title={`Return Request for ${transaction.invoice_no}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
                <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Request Customer Return</h3>
                    <p className="text-sm text-gray-500 mt-1">Original Invoice: <span className="font-mono font-bold">{transaction.invoice_no}</span></p>
                </div>

                <form onSubmit={submit}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-12">Return?</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchased Qty</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Return Qty</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={item.transaction_detail_id} className={item.include ? 'bg-yellow-50' : ''}>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={item.include}
                                                onChange={() => toggleItem(index)}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-600">{fmt(item.price)}</td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-900 font-semibold">{item.max_qty}</td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.max_qty}
                                                disabled={!item.include}
                                                value={item.return_qty}
                                                onChange={e => updateQty(index, e.target.value)}
                                                className="w-20 text-right border border-gray-300 rounded-md px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                            {item.include && item.return_qty > 0 ? fmt(item.return_qty * item.price) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-widest">Total Refund</td>
                                    <td className="px-6 py-4 text-right text-xl font-bold text-yellow-700">{fmt(totalRefund)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="px-6 py-5 border-t border-gray-100 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return</label>
                            <textarea
                                rows={3}
                                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                value={data.note}
                                onChange={e => setData('note', e.target.value)}
                                placeholder="Describe the reason (e.g., defective product, wrong item)..."
                            />
                        </div>
                        {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}

                        <div className="flex justify-end gap-3">
                            <Link href={`/transactions/${transaction.id}`} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || selectedItems.length === 0}
                                className="px-6 py-2 text-sm font-bold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {processing ? 'Submitting...' : `Submit Return Request (${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''})`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
