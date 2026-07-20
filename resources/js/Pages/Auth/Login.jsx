import { useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Login() {
    const { app, flash, store_setting } = usePage().props;
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                    <div>
                        {store_setting?.image_url ? (
                            <img src={store_setting.image_url} alt="Store Logo" className="h-20 object-contain mb-6 mx-auto" />
                        ) : (
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 mb-6 text-primary-600">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                                </svg>
                            </div>
                        )}
                        <h2 className="text-center text-3xl font-extrabold text-gray-900">
                            {store_setting?.name || app?.name || 'POS Kasir'}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Sign in to your account
                        </p>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium border border-green-200">
                            {flash.success}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={submit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                                <input
                                    type="email"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 border ${errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500'} placeholder-gray-400 rounded-lg focus:outline-none sm:text-sm`}
                                    placeholder="admin@pos.test"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 border ${errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500'} placeholder-gray-400 rounded-lg focus:outline-none sm:text-sm`}
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors shadow-md"
                            >
                                {processing ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Test Accounts:</h3>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>Admin:</strong> admin@pos.test / password</p>
                            <p><strong>Cashier:</strong> cashier@pos.test / password</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
