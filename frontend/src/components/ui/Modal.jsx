import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

const Modal = ({
    isOpen,
    onClose,
    title,
    footer,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdropClick = true
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-5xl',
        '5xl': 'max-w-7xl',
        full: 'max-w-[85vw]'
    };

    const handleBackdropClick = (e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primaryClr bg-opacity-50 overflow-y-auto"
            onClick={handleBackdropClick}
        >
            <div className={`w-full ${sizeClasses[size]} bg-backgroundClr rounded-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]`}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-5 border-b border-primaryClr/10 shrink-0">
                        {title && (
                            <h2 className="text-xl font-bold text-primaryClr">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-2 p-1.5 text-secondaryClr/50 hover:text-status-cancelled hover:bg-secondaryClr/5 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-grow">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end p-4 border-t gap-3 border-primaryClr/10 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;