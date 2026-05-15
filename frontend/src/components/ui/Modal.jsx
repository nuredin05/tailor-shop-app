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
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    const handleBackdropClick = (e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start pt-10 justify-center bg-secondaryClr bg-opacity-70"
            onClick={handleBackdropClick}
        >
            <div className={`w-full ${sizeClasses[size]} bg-backgroundClr  rounded-lg shadow-xl transform transition-all`}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-primaryClr/30 ">
                        {title && (
                            <h2 className="text-xl font-semibold text-primaryClr ">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-2 p-2 text-primaryClr hover:text-status-cancelled rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end p-4 border-t gap-3 border-primaryClr/30 ">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;