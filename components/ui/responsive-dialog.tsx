import * as React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export function ResponsiveDialog({
    children,
    isOpen,
    openDialog,
    title,
    description,
    closeDialog,
    className,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    openDialog: () => void;
    title: string;
    description?: string;
    closeDialog: () => void;
    className?: string;
}) {
    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={isOpen => (isOpen ? openDialog() : closeDialog())}>
                <DialogContent
                    className={cn('sm:max-w-[425px]', className)}
                    onEscapeKeyDown={closeDialog}
                    onInteractOutside={closeDialog}
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

    return (
        <Drawer open={isOpen} onOpenChange={isOpen => (isOpen ? openDialog() : closeDialog())}>
            <DrawerContent
                className={cn('mb-6', className)}
                onEscapeKeyDown={closeDialog}
                onInteractOutside={closeDialog}
                onDragClose={closeDialog}>
                <DrawerHeader className='text-left'>
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DrawerHeader>
                <div className='px-5 sm:px-6'>{children}</div>
            </DrawerContent>
        </Drawer>
    );
}
