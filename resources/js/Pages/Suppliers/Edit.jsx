import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Edit({ supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name,
        phone: supplier.phone || '',
        address: supplier.address || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/suppliers/${supplier.id}`);
    };

    return (
        <AdminLayout title={`Edit Supplier: ${supplier.name}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                <form onSubmit={submit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Supplier Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                            />
                            {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                rows={4}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                            />
                            {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Link href="/suppliers" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Update Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
