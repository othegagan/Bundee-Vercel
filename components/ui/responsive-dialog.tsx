import * as React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

export function ResponsiveDialog({
    children,
    isOpen,
    setIsOpen,
    title,
    description,
    closeDialog,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    description?: string;
    closeDialog: () => void;
}) {
    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className='sm:max-w-[425px]'
                    onEscapeKeyDown={() => closeDialog()}
                    onInteractOutside={() => closeDialog()}
                    onClickClose={() => closeDialog()}>
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
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className='mb-6' onEscapeKeyDown={() => closeDialog()} onInteractOutside={() => closeDialog()} onDragClose={() => closeDialog()}>
                <DrawerHeader className='text-left'>
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DrawerHeader>
                <div className='px-5  sm:px-6'>{children}</div>
            </DrawerContent>
        </Drawer>
    );
}

/**
  Useage example:

    const [isOpen, setIsOpen] = useState(false);

  const [data, setData] = useState<any>('');

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setData('');
    resetData();
  };

  const resetData = () => {
    setData('');
  };

<ResponsiveDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Delete Person"
        description="Are you sure you want to delete this person? This action cannot be undone."
        closeDialog={closeDialog}
      >
        <div className="flex flex-col gap-2 ">
          <Textarea
            autoFocus={false}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full h-40 p-2 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-700 focus:border-neutral-500 focus:ring-0 focus:outline-none"
          />
          <div className="flex w-full justify-end gap-4">
            <Button onClick={closeDialog} variant="outline">
              Cancel
            </Button>
            <Button onClick={closeDialog}>Save</Button>
          </div>
        </div>
      </ResponsiveDialog>

*/
