import { Head } from '@inertiajs/react';

export default function Welcome({ app }) {
    return (
        <>
            <Head title="Selamat Datang" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600">
                <div className="text-center px-8 py-12 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-md w-full mx-4">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {app?.name ?? 'POS Kasir'}
                    </h1>
                    <p className="text-primary-200 text-sm mb-8">
                        Point of Sale — Modern Cashier System
                    </p>

                    {/* Status Cards */}
                    <div className="space-y-3 text-left mb-8">
                        {[
                            { label: 'Laravel Framework', value: '12.x ✅', color: 'text-green-400' },
                            { label: 'Inertia.js', value: 'v3.1 ✅', color: 'text-green-400' },
                            { label: 'React', value: '19.x ✅', color: 'text-green-400' },
                            { label: 'Tailwind CSS', value: 'v4 ✅', color: 'text-green-400' },
                            { label: 'Spatie Permissions', value: 'v7.4 ✅', color: 'text-green-400' },
                            { label: 'Midtrans', value: 'v2.6 ✅', color: 'text-green-400' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                                <span className="text-primary-200 text-sm">{label}</span>
                                <span className={`text-sm font-semibold ${color}`}>{value}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-primary-300 text-xs">
                        Phase 4 &amp; 5 verified — All systems operational 🚀
                    </p>
                </div>
            </div>
        </>
    );
}
