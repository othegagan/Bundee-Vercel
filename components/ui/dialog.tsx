'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';

interface DialogProps {
    isOpen: boolean;
    openDialog?: () => void;
    closeDialog: () => void;
    children: React.ReactNode;
    className?: string;
    onInteractOutside?: boolean;
    title?: string;
    description?: string;
}

function Dialog({ isOpen, closeDialog, children, className, onInteractOutside = true, title, description }: DialogProps) {
    useEffect(() => {
        const body = document.body;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onInteractOutside && e.target === e.currentTarget) {
            closeDialog();
        }
    };

    if (!isOpen) return null;

    return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
            className={cn(
                'fixed inset-0 z-[100] flex items-end bg-black/50 backdrop-blur-[1px] sm:items-center sm:justify-center',
                isOpen ? 'animate-in fade-in-0' : 'animate-out fade-out-0',
            )}
            onClick={handleBackdropClick}
            data-state={isOpen ? 'open' : 'closed'}>
            <div
                className={cn(
                    'w-full transform overflow-hidden rounded-t-lg bg-white px-6 py-4 transition-all ease-in-out sm:m-4 sm:max-w-xl sm:rounded-lg',
                    isOpen ? 'animate-in zoom-in-95' : 'animate-out zoom-out-95 slide-out-to-bottom-1/2',
                    className,
                )}
                role='dialog'>
                <div className='mb-4 flex flex-col space-y-1.5 text-left sm:mb-6'>
                    <h2 id='radix-:rg:' className='text-left text-lg font-semibold leading-none tracking-tight'>
                        {title}
                    </h2>
                    <p id='radix-:rh:' className='text-sm text-muted-foreground'>
                        {description}
                    </p>
                </div>

                <button
                    type='button'
                    className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
                    onClick={closeDialog}>
                    <X className='size-5' />
                    <span className='sr-only'>Close</span>
                </button>
                <div>{children}</div>
            </div>
        </div>
    );
}

interface DialogBodyProps {
    children: React.ReactNode;
    className?: string;
}

function DialogBody({ children, className }: DialogBodyProps) {
    return <div className={cn('translate max-h-[calc(100dvh-16rem)] overflow-y-auto md:max-h-min md:overflow-y-hidden lg:pb-0', className)}>{children}</div>;
}

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

function DialogFooter({ children, className }: DialogFooterProps) {
    return (
        <footer className={cn('-mx-6 -mb-4 grid select-none grid-cols-2 items-center justify-end gap-4 p-5 sm:flex-row md:flex', className)}>{children}</footer>
    );
}

export { Dialog, DialogBody, DialogFooter };
