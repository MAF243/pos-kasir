import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/categories');
    };

    return (
        <AdminLayout title="Create Category">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                <form onSubmit={submit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. Beverages"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                            <p className="mt-2 text-xs text-gray-500">The slug will be automatically generated from the name.</p>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Link href="/categories" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
