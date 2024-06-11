import * as React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function ResponsiveDialog({
    children,
    isOpen,
    openDialog,
    title,
    description,
    closeDialog,
    className,
    closeOnClickOutside = true,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    openDialog: () => void;
    title?: string;
    description?: string;
    closeDialog: () => void;
    className?: string;
    closeOnClickOutside?: boolean;
}) {

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            openDialog();
        } else {
            closeDialog();
        }
    };

    const handleEscapeKeyDown = (event: any) => {
        if (closeOnClickOutside) {
            closeDialog();
        } else {
            event.preventDefault();
        }
    };

    const handleInteractOutside = (event: any) => {
        if (closeOnClickOutside) {
            closeDialog();
        } else {
            event.preventDefault();
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn('sm:max-w-[425px]', className)}
                onEscapeKeyDown={handleEscapeKeyDown}
                onInteractOutside={handleInteractOutside}
                onClickClose={closeDialog}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );

}
