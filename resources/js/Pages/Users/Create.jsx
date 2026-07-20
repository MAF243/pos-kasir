import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Create({ roles }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <AdminLayout title="Create User">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                <form onSubmit={submit}>
                    <div className="p-6 space-y-6">
                        
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 focus:ring-primary-500 focus:border-primary-500 rounded-md shadow-sm sm:text-sm`}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Role Assignment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assign Role</label>
                            <select
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} sm:text-sm rounded-md bg-white`}
                                value={data.role}
                                onChange={e => setData('role', e.target.value)}
                            >
                                <option value="" disabled>Select a role...</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                            {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
                        </div>

                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Link href="/users" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
