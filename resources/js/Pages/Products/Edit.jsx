import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Edit({ product, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        category_id: product.category_id,
        barcode: product.barcode || '',
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        image: null,
        _method: 'PUT', // Required for file uploads with PUT method in Laravel
    });

    const [imagePreview, setImagePreview] = useState(product.image_url || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(product.image_url || null);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/products/${product.id}`); // Using POST here because of multipart/form-data and _method: PUT
    };

    return (
        <AdminLayout title={`Edit Product: ${product.name}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Basic Info */}
                        <div className="space-y-6 md:col-span-2">
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                            <select
                                required
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors.category_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} sm:text-sm rounded-md bg-white`}
                                value={data.category_id}
                                onChange={e => setData('category_id', e.target.value)}
                            >
                                <option value="" disabled>Select category...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="mt-2 text-sm text-red-600">{errors.category_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Barcode</label>
                            <input
                                type="text"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.barcode ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm font-mono`}
                                value={data.barcode}
                                onChange={e => setData('barcode', e.target.value)}
                            />
                            {errors.barcode && <p className="mt-2 text-sm text-red-600">{errors.barcode}</p>}
                        </div>

                        {/* Pricing */}
                        <div className="space-y-6 md:col-span-2 mt-4">
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Pricing</h4>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Purchase Price (IDR) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="0"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.purchase_price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.purchase_price}
                                onChange={e => setData('purchase_price', e.target.value)}
                            />
                            {errors.purchase_price && <p className="mt-2 text-sm text-red-600">{errors.purchase_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Selling Price (IDR) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="0"
                                className={`mt-1 block w-full px-3 py-2 border ${errors.selling_price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-md shadow-sm sm:text-sm`}
                                value={data.selling_price}
                                onChange={e => setData('selling_price', e.target.value)}
                            />
                            {errors.selling_price && <p className="mt-2 text-sm text-red-600">{errors.selling_price}</p>}
                        </div>

                        {/* Media */}
                        <div className="space-y-6 md:col-span-2 mt-4">
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Media</h4>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                                <div className="mt-2 flex items-center gap-6">
                                    <div className="flex-shrink-0 h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">Leave blank to keep existing image. PNG, JPG up to 2MB.</p>
                                        {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        <Link href="/products" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
