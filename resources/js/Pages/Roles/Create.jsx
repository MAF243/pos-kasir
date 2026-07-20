import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create({ permissions }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [],
    });

    const handleCheckboxChange = (e) => {
        let currentPermissions = [...data.permissions];
        if (e.target.checked) {
            currentPermissions.push(e.target.value);
        } else {
            currentPermissions = currentPermissions.filter((item) => item !== e.target.value);
        }
        setData('permissions', currentPermissions);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/roles');
    };

    return (
        <AdminLayout title="Create Role">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl">
                <form onSubmit={submit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role Name</label>
                            <input
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. Manager"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Assign Permissions</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {permissions.map((permission) => (
                                    <div key={permission.id} className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id={`permission-${permission.id}`}
                                                type="checkbox"
                                                value={permission.name}
                                                checked={data.permissions.includes(permission.name)}
                                                onChange={handleCheckboxChange}
                                                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                                                {permission.name}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Link href="/roles" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Role'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
