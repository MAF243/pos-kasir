import { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Index({ setting }) {
    const [logoPreview, setLogoPreview] = useState(setting.image_url);
    const fileInput = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // For multipart/form-data via POST
        name: setting.name || '',
        phone: setting.phone || '',
        address: setting.address || '',
        receipt_footer: setting.receipt_footer || '',
        logo: null,
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/settings', {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Store Settings">
            <div className="max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">General Settings</h3>
                    <p className="text-sm text-gray-500 mt-1">Configure your store information and receipt footer.</p>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* Logo Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Store Logo</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInput}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInput.current.click()}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                                >
                                    Change Logo
                                </button>
                                <p className="mt-2 text-xs text-gray-500">PNG, JPG, or SVG. Max 2MB.</p>
                                {errors.logo && <p className="mt-1 text-xs text-red-600">{errors.logo}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className={`block w-full border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500`}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        {/* Phone */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className={`block w-full border ${errors.phone ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500`}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                rows="3"
                                className={`block w-full border ${errors.address ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500`}
                            />
                            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                        </div>

                        {/* Receipt Footer */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Footer Note</label>
                            <textarea
                                value={data.receipt_footer}
                                onChange={e => setData('receipt_footer', e.target.value)}
                                rows="2"
                                placeholder="e.g. Thank you for your purchase!"
                                className={`block w-full border ${errors.receipt_footer ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500`}
                            />
                            {errors.receipt_footer && <p className="mt-1 text-xs text-red-600">{errors.receipt_footer}</p>}
                            <p className="mt-1 text-xs text-gray-500">This text will appear at the bottom of the thermal receipt.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
