import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Pagination from '../../Components/Pagination';
import SearchInput from '../../Components/SearchInput';
import DeleteModal from '../../Components/DeleteModal';

export default function Index({ expenses, filters, activeShift }) {
    const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v ?? 0);
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        note: '',
        date: today,
    });

    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [deleteId, setDeleteId] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post('/expenses', {
            onSuccess: () => reset(),
        });
    };

    const startEdit = (expense) => {
        setEditingId(expense.id);
        setEditData({ amount: expense.amount, note: expense.note, date: expense.date?.split('T')[0] ?? today });
    };

    const saveEdit = (id) => {
        router.put(`/expenses/${id}`, editData, {
            onSuccess: () => setEditingId(null),
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Store Expenses">
            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { router.delete(`/expenses/${deleteId}`, { onSuccess: () => setDeleteId(null), preserveScroll: true }); }}
                title="Delete Expense?"
                message="Are you sure you want to delete this expense record? This action cannot be undone."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Add Expense Form ── */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Record New Expense</h3>

                        {!activeShift ? (
                            <div className="flex flex-col items-center text-center py-4 gap-3 text-sm text-gray-600 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <p className="font-semibold text-yellow-800">No Active Shift</p>
                                <p className="text-yellow-700 text-xs">You must have an open shift to record expenses. Expenses are deducted from the active cash drawer.</p>
                                <Link href="/shifts/create" className="inline-flex px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700">Open a Shift</Link>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (IDR) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className={`block w-full border ${errors.amount ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500`}
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        placeholder="e.g. 50000"
                                    />
                                    {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Note / Description <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className={`block w-full border ${errors.note ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500`}
                                        value={data.note}
                                        onChange={e => setData('note', e.target.value)}
                                        placeholder="e.g. Office supplies, cleaning"
                                    />
                                    {errors.note && <p className="mt-1 text-xs text-red-600">{errors.note}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        className="block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                    />
                                </div>
                                <div className="pt-1 text-xs text-gray-500 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                    💡 Linked to shift <strong>#{activeShift.id}</strong> (currently open)
                                </div>
                                <button type="submit" disabled={processing} className="w-full py-2.5 text-sm font-bold text-white bg-danger-600 rounded-lg hover:bg-danger-700 disabled:opacity-50 shadow-sm">
                                    {processing ? 'Recording...' : 'Record Expense'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* ── Expenses Table ── */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="mb-4">
                            <SearchInput value={filters.search} placeholder="Search by note..." />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {expenses.data.length === 0 ? (
                                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">No expenses found.</td></tr>
                                    ) : (
                                        expenses.data.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-gray-50">
                                                {editingId === expense.id ? (
                                                    <>
                                                        <td className="px-4 py-3">
                                                            <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="border border-gray-300 rounded px-2 py-1 text-xs w-32" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input type="text" value={editData.note} onChange={e => setEditData({...editData, note: e.target.value})} className="border border-gray-300 rounded px-2 py-1 text-xs w-full" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input type="number" value={editData.amount} onChange={e => setEditData({...editData, amount: e.target.value})} className="border border-gray-300 rounded px-2 py-1 text-xs w-28 text-right" />
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-500">{expense.user?.name}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex gap-2 justify-center">
                                                                <button onClick={() => saveEdit(expense.id)} className="text-xs text-green-600 hover:text-green-800 font-semibold">Save</button>
                                                                <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{expense.date?.split('T')[0] ?? '—'}</td>
                                                        <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{expense.note}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-danger-700">{fmt(expense.amount)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{expense.user?.name}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {expense.shift?.status === 'open' && (
                                                                <div className="flex gap-2 justify-center">
                                                                    <button onClick={() => startEdit(expense)} className="text-xs text-primary-600 hover:text-primary-800 font-semibold">Edit</button>
                                                                    <button onClick={() => setDeleteId(expense.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Delete</button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={expenses.links} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
