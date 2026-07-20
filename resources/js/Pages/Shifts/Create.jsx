import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create({ hasActiveShift }) {
    const { data, setData, post, processing, errors } = useForm({
        starting_cash: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/shifts');
    };

    return (
        <AdminLayout title="Open Cashier Shift">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-xl mx-auto mt-8">
                
                {hasActiveShift ? (
                    <div className="p-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Active Shift Detected</h3>
                        <p className="text-gray-500 mb-6">
                            You currently have an open shift. You must close your active shift before opening a new one.
                        </p>
                        <Link href="/shifts" className="inline-flex justify-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                            Go to Shift Management
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Start Your Shift</h3>
                                <p className="mt-2 text-sm text-gray-500">Please enter the starting cash amount in your drawer.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Starting Cash (IDR) <span className="text-red-500">*</span></label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-lg">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className={`block w-full pl-10 pr-4 py-4 text-xl border ${errors.starting_cash ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg`}
                                        value={data.starting_cash}
                                        onChange={e => setData('starting_cash', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                {errors.starting_cash && <p className="mt-2 text-sm text-red-600">{errors.starting_cash}</p>}
                            </div>
                        </div>

                        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <Link href="/shifts" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center px-6 py-2 text-base font-bold text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
                            >
                                {processing ? 'Opening Shift...' : 'Open Shift'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}
