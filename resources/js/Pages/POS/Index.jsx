import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value ?? 0);

// ─── Cart Item Row ──────────────────────────────────────────────────────────
function CartItem({ item, onIncrease, onDecrease, onRemove }) {
    return (
        <div className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0 group">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(item.price)} / unit</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 bg-slate-100/50 p-1 rounded-lg border border-slate-100">
                <button onClick={() => onDecrease(item.id)} className="w-7 h-7 rounded-md bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 flex items-center justify-center text-lg font-bold transition-all duration-200 active:scale-95">−</button>
                <span className="w-6 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                <button onClick={() => onIncrease(item.id)} className="w-7 h-7 rounded-md bg-white border border-slate-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-600 flex items-center justify-center text-lg font-bold transition-all duration-200 active:scale-95">+</button>
            </div>
            <div className="text-right shrink-0 w-24 flex flex-col justify-center items-end">
                <p className="text-sm font-bold text-slate-900">{formatCurrency(item.price * item.qty)}</p>
                <button onClick={() => onRemove(item.id)} className="text-xs font-medium text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Remove
                </button>
            </div>
        </div>
    );
}

// ─── Product Card ───────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }) {
    const outOfStock = product.stock <= 0;
    return (
        <button
            onClick={() => !outOfStock && onAdd(product)}
            disabled={outOfStock}
            className={`relative flex flex-col rounded-xl border text-left overflow-hidden transition-all duration-200 active:scale-95 ${
                outOfStock
                    ? 'border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed grayscale-[50%]'
                    : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
            }`}
        >
            {/* Product Image */}
            <div className="w-full h-32 bg-slate-100 overflow-hidden relative">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px]">
                        <span className="text-white text-xs font-bold uppercase tracking-widest bg-red-600/90 px-3 py-1.5 rounded shadow-sm">Out of Stock</span>
                    </div>
                )}
            </div>
            {/* Info */}
            <div className="p-3.5 bg-white">
                <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{product.name}</p>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                    <p className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Stock: {product.stock}</p>
                </div>
            </div>
        </button>
    );
}

// ─── Main POS Page ─────────────────────────────────────────────────────────
export default function Index({ shift, categories, products }) {
    const { flash } = usePage().props;

    // ── State ─────────────────────────────
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [discount, setDiscount] = useState(0);
    const [pay, setPay] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const searchRef = useRef(null);

    // Auto-focus search on mount
    useEffect(() => { searchRef.current?.focus(); }, []);

    // ── Product filtering ─────────────────
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
            const matchesSearch = !search || 
                p.name.toLowerCase().includes(search.toLowerCase()) || 
                (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, search]);

    // ── Cart Actions ──────────────────────
    const addToCart = useCallback((product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            // Check stock ceiling
            const currentQty = existing ? existing.qty : 0;
            if (currentQty >= product.stock) return prev;
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, stock: product.stock }];
        });
    }, []);

    // Listen for Enter key on search for barcode scanner support
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            const exact = products.find(p => p.barcode === search.trim());
            if (exact && exact.stock > 0) {
                addToCart(exact);
                setSearch('');
            }
        }
    };

    const increaseQty = (id) => {
        setCart(prev => prev.map(i => {
            if (i.id !== id) return i;
            if (i.qty >= i.stock) return i; // stock ceiling
            return { ...i, qty: i.qty + 1 };
        }));
    };

    const decreaseQty = (id) => {
        setCart(prev => {
            const item = prev.find(i => i.id === id);
            if (item && item.qty <= 1) return prev.filter(i => i.id !== id);
            return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

    // ── Calculations ──────────────────────
    const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
    const discountAmount = useMemo(() => Math.min(Number(discount) || 0, subtotal), [discount, subtotal]);
    const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);
    const payAmount = Number(pay) || 0;
    const change = useMemo(() => Math.max(0, payAmount - total), [payAmount, total]);
    const insufficientPay = payAmount < total && cart.length > 0 && paymentMethod === 'cash';

    // ── Checkout ──────────────────────────
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (paymentMethod === 'cash' && payAmount < total) {
            toast.error('Payment amount is insufficient.');
            return;
        }
        setIsProcessing(true);

        try {
            const response = await fetch('/pos/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    shift_id: shift.id,
                    cart: cart.map(i => ({ product_id: i.id, name: i.name, qty: i.qty, price: i.price })),
                    subtotal,
                    discount: discountAmount,
                    total,
                    pay: paymentMethod === 'cash' ? payAmount : total,
                    change: paymentMethod === 'cash' ? change : 0,
                    payment_method: paymentMethod,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                const msgs = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : data.message || 'Transaction failed. Please try again.';
                toast.error(msgs);
                setIsProcessing(false);
                return;
            }

            // ── Cash: go directly to receipt ──
            if (paymentMethod === 'cash') {
                router.visit(`/pos/receipt/${data.transaction_id}`);
                return;
            }

            // ── Digital (QRIS): trigger Midtrans Snap popup ──
            if (data.snap_token && window.snap) {
                setIsProcessing(false); // Allow UI to respond while popup is open
                window.snap.pay(data.snap_token, {
                    onSuccess: function (result) {
                        // Payment settled — go to receipt
                        router.visit(`/pos/receipt/${data.transaction_id}`);
                    },
                    onPending: function (result) {
                        // Payment pending (e.g., VA waiting for transfer)
                        router.visit(`/pos/receipt/${data.transaction_id}`);
                    },
                    onError: function (result) {
                        toast.error('Digital payment was declined or encountered an error. Please try again.');
                    },
                    onClose: function () {
                        // User closed the popup without completing
                        toast.error('Payment was cancelled. The transaction has been voided.');
                    },
                });
            } else if (!window.snap) {
                toast.error('Midtrans Snap is not loaded. Please check your internet connection and refresh the page.');
                setIsProcessing(false);
            }
        } catch (err) {
            toast.error('Network error. Please try again.');
            setIsProcessing(false);
        }
    };

    const setExactPay = () => setPay(String(total));

    return (
        <>
            <Head title="POS Cashier" />
            <Toaster position="top-right" toastOptions={{
                duration: 4000,
                style: { background: '#fff', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }
            }} />

            {/* Full-screen POS layout — no AdminLayout */}
            <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">

                {/* ── Top Bar ──────────────────────────────────────────── */}
                <header className="flex items-center justify-between bg-primary-900 text-white px-4 py-2.5 shrink-0 shadow-lg z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-primary-200 hover:text-white transition-colors text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back
                        </Link>
                        <span className="text-lg font-bold tracking-wider">⚡ POS KASIR</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="hidden sm:flex items-center gap-1.5 bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Shift #{shift.id} Active
                        </span>
                        <Link href="/shifts" className="text-primary-300 hover:text-white text-xs">Manage Shift</Link>
                    </div>
                </header>

                {/* ── Main Body ─────────────────────────────────────────── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* ═══ LEFT PANE — Products ═══════════════════════════ */}
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* Search & Category Bar */}
                        <div className="bg-white px-6 py-4 border-b border-slate-200 shrink-0 space-y-4 shadow-sm z-10">
                            {/* Search (also works as barcode scanner input) */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Search product or scan barcode then press Enter..."
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>

                            {/* Category filters */}
                            <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${selectedCategory === 'all' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    All Products
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {filteredProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-base font-medium">No products found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-5 pb-20">
                                    {filteredProducts.map(product => (
                                        <ProductCard key={product.id} product={product} onAdd={addToCart} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══ RIGHT PANE — Cart & Checkout ════════════════════ */}
                    <div className="w-[380px] xl:w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-2xl relative z-20">

                        {/* Cart Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-white shrink-0">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Current Order
                                {cart.length > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold text-white bg-emerald-500 rounded-full">
                                        {cart.reduce((s, i) => s + i.qty, 0)}
                                    </span>
                                )}
                            </h2>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded-md hover:bg-red-100 transition-colors">Clear All</button>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 bg-slate-50/30">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 py-16">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                    <p className="text-sm text-center font-medium">Cart is empty.<br/><span className="text-xs font-normal">Click a product to add it.</span></p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {cart.map(item => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            onIncrease={increaseQty}
                                            onDecrease={decreaseQty}
                                            onRemove={removeFromCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Checkout Panel */}
                        <div className="border-t border-slate-200 px-6 pt-5 pb-6 space-y-5 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            {/* Subtotal / Discount / Total */}
                            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                    <span>Discount (Rp)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={subtotal}
                                        className="w-32 text-right border border-slate-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold bg-white"
                                        value={discount}
                                        onChange={e => setDiscount(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex justify-between text-lg font-black text-slate-900 pt-3 mt-1 border-t border-slate-200">
                                    <span>TOTAL</span>
                                    <span className="text-emerald-600">{formatCurrency(total)}</span>
                                </div>
                            </div>

                            {/* Payment Method Toggle */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 active:scale-95 ${paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm' : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                    💵 Cash
                                </button>
                                <button
                                    onClick={() => { setPaymentMethod('qris'); setPay(String(total)); }}
                                    className={`py-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 active:scale-95 ${paymentMethod === 'qris' ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm' : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                    📱 QRIS
                                </button>
                            </div>

                            {/* Cash inputs */}
                            {paymentMethod === 'cash' && (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className={`flex-1 border-2 ${insufficientPay ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-xl px-4 py-3 text-lg font-black focus:outline-none focus:ring-2 transition-all`}
                                            value={pay}
                                            onChange={e => setPay(e.target.value)}
                                            placeholder="Cash received..."
                                        />
                                        <button onClick={setExactPay} className="shrink-0 text-sm px-4 bg-slate-800 hover:bg-slate-900 rounded-xl font-bold text-white transition-colors active:scale-95 shadow-sm">Exact</button>
                                    </div>
                                    <div className={`flex justify-between items-center text-sm font-black px-4 py-3 rounded-xl border ${change > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                        <span>Change (Kembalian)</span>
                                        <span className="text-lg">{formatCurrency(change)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing || cart.length === 0 || (paymentMethod === 'cash' && insufficientPay)}
                                className="w-full py-4 text-lg font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </span>
                                ) : cart.length === 0 ? 'Add Items to Cart' : `Charge ${formatCurrency(total)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
