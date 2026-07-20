import { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../Components/Sidebar';

export default function AdminLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            <Toaster position="top-right" toastOptions={{
                duration: 4000,
                style: { background: '#fff', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }
            }} />
            <Head title={title} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-0 overflow-hidden bg-slate-50">
                
                {/* Top Navbar */}
                <header className="flex-shrink-0 relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
                    {/* Mobile Hamburger */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Navbar Title */}
                    <div className="flex-1 flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
                            {title}
                        </h1>
                        
                        {/* Top Right Actions */}
                        <div className="ml-auto flex items-center gap-4">
                            <button className="text-gray-400 hover:text-gray-500 relative p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-sm font-medium text-gray-500 hover:text-danger-600 transition-colors gap-2 px-3 py-2 rounded-lg hover:bg-danger-50"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar">
                    {/* Page Content */}
                    <div className="py-8 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
