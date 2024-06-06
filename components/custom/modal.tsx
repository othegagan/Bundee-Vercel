'use client';

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

function Modal({ isOpen, onClose, children, className }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className='enter enter-active fixed inset-0 z-[99] flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center'
            onClick={handleBackdropClick}>
            <div
                className={`translate  w-full transform overflow-hidden rounded-t-lg bg-white px-6 py-4 transition-all duration-300  sm:m-4 sm:max-w-xl sm:rounded-lg   ${className} `}
                role='dialog'>
                <div data-focus-lock-disabled='false'>{children}</div>
            </div>
        </div>
    );
}

interface ModalHeaderProps {
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

function ModalHeader({ onClose, children, className }: ModalHeaderProps) {
    return (
        <header className={`mb-4 flex justify-between ${className}`}>
            <h4 className='text-lg font-medium'>{children}</h4>
            <button
                className='hover: inline-flex h-6 w-6 items-center justify-center rounded text-neutral-400 transition-colors duration-150 hover:text-neutral-700  '
                aria-label='close'
                onClick={onClose}>
                <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20' role='img' aria-hidden='true'>
                    <path
                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                        clipRule='evenodd'
                        fillRule='evenodd'
                    />
                </svg>
            </button>
        </header>
    );
}

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

function ModalBody({ children, className }: ModalBodyProps) {
    return (
        <div
            className={`translate mb-6 h-full max-h-[600px] translate-y-0 overflow-y-auto text-sm   text-neutral-700 opacity-100 duration-300 dark:text-neutral-400 lg:max-h-[800px] ${className}`}>
            {children}
        </div>
    );
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <footer
            className={`-mx-6 -mb-4 flex flex-col items-center justify-end space-y-4 px-6 py-3 dark:bg-neutral-800 sm:flex-row sm:space-x-6 sm:space-y-0 ${className}`}>
            {children}
        </footer>
    );
}

export { Modal, ModalHeader, ModalBody, ModalFooter };
