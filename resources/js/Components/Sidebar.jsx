import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { auth, store_setting } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const roles = auth.user?.roles || [];
    
    const hasPermission = (permission) => permissions.includes(permission) || roles.includes('Admin');

    const menuItems = [
        { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', href: '/dashboard', show: hasPermission('view_dashboard') },
        { name: 'POS Cashier', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', href: '/pos', show: hasPermission('process_transaction'), highlight: true },
        { name: 'Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', href: '/transactions', show: hasPermission('view_transactions') },
        { name: 'Customer Returns', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', href: '/customer-returns', show: hasPermission('manage_returns') },
        { name: 'Store Expenses', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', href: '/expenses', show: true },
        
        { name: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', href: '#', show: hasPermission('view_reports'), isGroup: true },
        { name: 'Sales Report', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', href: '/reports/sales', show: hasPermission('view_reports'), isSubmenu: true },
        { name: 'Profitability Report', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', href: '/reports/profit', show: hasPermission('view_reports'), isSubmenu: true },
        { name: 'Stock Report', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', href: '/reports/stock', show: hasPermission('view_reports'), isSubmenu: true },

        { name: 'Categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', href: '/categories', show: hasPermission('manage_categories') },
        { name: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', href: '/products', show: hasPermission('manage_products') },
        { name: 'Stock Movements', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', href: '/stock-movements', show: hasPermission('manage_stock') },
        { name: 'Stock Opname', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', href: '/stock-opnames', show: hasPermission('manage_stock') },
        { name: 'Supplier Purchases', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', href: '/purchases', show: hasPermission('manage_purchases') },
        { name: 'Supplier Returns', icon: 'M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z', href: '/supplier-returns', show: hasPermission('manage_purchases') },
        { name: 'Shift Management', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '/shifts', show: true },
        { name: 'Suppliers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', href: '/suppliers', show: hasPermission('manage_suppliers') },
        { name: 'Customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', href: '/customers', show: hasPermission('manage_customers') },
        { name: 'Roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', href: '/roles', show: hasPermission('manage_roles') },
        { name: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', href: '/users', show: hasPermission('manage_users') },
        { name: 'Store Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', href: '#', show: hasPermission('manage_settings') },
    ];

    const isCurrent = (href) => {
        if (href === '#') return false;
        return window.location.pathname === href || window.location.pathname.startsWith(`${href}/`);
    };

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Desktop & Mobile */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-sidebar-bg text-sidebar-text shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Logo Area */}
                <div className="flex items-center justify-center h-16 bg-primary-950/50 border-b border-primary-800/50 px-4">
                    <span className="text-xl font-bold text-white tracking-wider flex items-center gap-2 truncate">
                        {store_setting?.image_url ? (
                            <img src={store_setting.image_url} alt="Logo" className="h-8 w-8 object-contain bg-white rounded p-0.5 shrink-0" />
                        ) : (
                            <svg className="w-6 h-6 text-accent-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                        <span className="truncate">{store_setting?.name || 'POS KASIR'}</span>
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.filter(item => item.show).map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                item.highlight
                                    ? isCurrent(item.href)
                                        ? 'bg-accent-500 text-white shadow-md'
                                        : 'bg-accent-600/20 text-accent-300 hover:bg-accent-500 hover:text-white border border-accent-500/30'
                                    : isCurrent(item.href)
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                {item.name === 'Store Settings' && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                )}
                            </svg>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* User Info Bottom */}
                <div className="p-4 bg-primary-950/50 border-t border-primary-800/50">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold border-2 border-primary-500">
                            {auth.user?.name.charAt(0)}
                        </div>
                        <div className="ml-3 truncate">
                            <p className="text-sm font-medium text-white truncate">{auth.user?.name}</p>
                            <p className="text-xs text-primary-300 capitalize">{roles.join(', ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
