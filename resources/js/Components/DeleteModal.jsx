import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function DeleteModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Deletion', 
    message = 'Are you sure you want to delete this item? This action cannot be undone.' 
}) {
    // Close modal on 'Escape' key press
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (typeof onConfirm === 'string') {
            // If onConfirm is a URL string, let the modal handle the Inertia DELETE request
            router.delete(onConfirm, {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        } else if (typeof onConfirm === 'function') {
            // If onConfirm is a custom function, let the parent handle the logic
            onConfirm();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
                aria-hidden="true"
            ></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md mx-auto my-6 z-50 p-4 transform transition-all">
                <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl outline-none focus:outline-none">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-100 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-100 shrink-0">
                                <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {title}
                            </h3>
                        </div>
                        <button
                            className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <span className="block w-6 h-6 text-2xl outline-none focus:outline-none">&times;</span>
                        </button>
                    </div>
                    
                    {/* Body */}
                    <div className="relative p-6 flex-auto">
                        <p className="text-gray-600 text-base leading-relaxed">
                            {message}
                        </p>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-end p-5 border-t border-solid border-gray-100 rounded-b-2xl gap-3 bg-gray-50">
                        <button
                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all shadow-sm"
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-danger-600 rounded-lg hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500 shadow-md transition-all"
                            type="button"
                            onClick={handleConfirm}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
