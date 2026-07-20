import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Show({ shift }) {
    const { data, setData, put, processing, errors } = useForm({
        ending_cash: '',
    });

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const submit = (e) => {
        e.preventDefault();
        put(`/shifts/${shift.id}`);
    };

    const isOpen = shift.status === 'open';

    return (
        <AdminLayout title={`Shift Details #${shift.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl leading-6 font-bold text-gray-900">Shift Record</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Managed by {shift.user?.name}</p>
                    </div>
                    <div>
                        {isOpen ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 uppercase tracking-wider">
                                Active Shift
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800 uppercase tracking-wider">
                                Closed
                            </span>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="px-6 py-6 border-b border-gray-200">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                            <dd className="mt-1 text-base text-gray-900">{formatDateTime(shift.start_time)}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">End Time</dt>
                            <dd className="mt-1 text-base text-gray-900">{formatDateTime(shift.end_time)}</dd>
                        </div>
                        
                        <div className="sm:col-span-1">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <dt className="text-sm font-medium text-gray-500">Starting Cash Drawer</dt>
                                <dd className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(shift.starting_cash)}</dd>
                            </div>
                        </div>
                        
                        <div className="sm:col-span-1">
                            {isOpen ? (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 border-dashed">
                                    <dt className="text-sm font-medium text-blue-700">Expected Ending Cash</dt>
                                    <dd className="mt-1 text-sm text-blue-600">
                                        <em>Sales calculation will be injected here in upcoming phases...</em>
                                    </dd>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500">Final Ending Cash Drawer</dt>
                                    <dd className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(shift.ending_cash)}</dd>
                                </div>
                            )}
                        </div>
                    </dl>
                </div>

                {/* Close Shift Form */}
                {isOpen && (
                    <div className="px-6 py-6 bg-yellow-50 border-t-4 border-yellow-400">
                        <h4 className="text-lg font-bold text-yellow-800 mb-4">Close Shift</h4>
                        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Counted Ending Cash (IDR) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className={`block w-full px-4 py-3 text-lg border ${errors.ending_cash ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm`}
                                    value={data.ending_cash}
                                    onChange={e => setData('ending_cash', e.target.value)}
                                    placeholder="Enter physical cash in drawer"
                                />
                                {errors.ending_cash && <p className="mt-2 text-sm text-red-600">{errors.ending_cash}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto inline-flex justify-center px-6 py-3 text-base font-bold text-white bg-danger-600 border border-transparent rounded-md shadow-sm hover:bg-danger-700 disabled:opacity-50"
                            >
                                {processing ? 'Closing...' : 'Close Shift Now'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
