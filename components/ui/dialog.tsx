'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

interface DialogProps {
    isOpen: boolean;
    openDialog?: () => void;
    closeDialog: () => void;
    children: React.ReactNode;
    className?: string;
    onInteractOutside?: boolean;
    title?: string;
    description?: string;
    showCloseButton?: boolean;
}

function Dialog({ isOpen, closeDialog, children, className, onInteractOutside = true, showCloseButton = true, title, description, ...props }: DialogProps) {
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
        <div
            className={cn(
                'fixed inset-0 z-[100] flex items-end bg-black/50 backdrop-blur-[1px] sm:items-center sm:justify-center',
                isOpen ? 'fade-in-0 animate-in' : 'fade-out-0 animate-out'
            )}
            onClick={handleBackdropClick}
            data-state={isOpen ? 'open' : 'closed'}>
            <div
                className={cn(
                    'w-full transform overflow-hidden rounded-t-lg bg-white px-6 py-4 transition-all ease-in-out sm:m-4 sm:max-w-xl sm:rounded-lg',
                    isOpen ? 'zoom-in-95 animate-in' : 'zoom-out-95 slide-out-to-bottom-1/2 animate-out',
                    className
                )}>
                <div className='mb-4 flex flex-col space-y-1.5 text-left sm:mb-6'>
                    <h2 id='radix-:rg:' className='text-left font-semibold text-lg leading-none tracking-tight'>
                        {title}
                    </h2>
                    <p id='radix-:rh:' className='text-muted-foreground text-sm'>
                        {description}
                    </p>
                </div>

                {showCloseButton && (
                    <button
                        type='button'
                        className='absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
                        onClick={closeDialog}>
                        <X className='size-5' />
                        <span className='sr-only'>Close</span>
                    </button>
                )}
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

const DialogPortal = DialogPrimitive.Portal;
const DialogRoot = DialogPrimitive.Root;

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
    ({ className, ...props }, ref) => (
        <DialogPrimitive.Overlay
            ref={ref}
            className={cn(
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in',
                className
            )}
            {...props}
        />
    )
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
    ({ className, children, ...props }, ref) => (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg',
                    className
                )}
                {...props}>
                {children}
                <DialogPrimitive.Close className='absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
                    <X className='h-4 w-4' />
                    <span className='sr-only'>Close</span>
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DialogPortal>
    )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export { Dialog, DialogBody, DialogFooter, DialogRoot, DialogOverlay, DialogContent };
