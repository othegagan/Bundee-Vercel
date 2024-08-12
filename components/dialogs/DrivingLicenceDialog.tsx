'use client';

import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import { Button } from '../ui/button';
import { Dialog, DialogBody } from '../ui/dialog';
import { useRouter } from 'next/navigation';

export default function DrivingLicenceDialog() {
    const router = useRouter();
    const { isOpen, isUpdate, onOpen, onClose } = useDrivingLicenceDialog();

    function handleRedirect() {
        router.push(`/idscan?callbackUrl=${encodeURIComponent(window.location.href)}`);
        closeModal();
    }

    function closeModal() {
        onClose();
    }

    return (
        <Dialog
            title={isUpdate ? '' : 'Verify Driving Licence'}
            isOpen={isOpen}
            openDialog={() => onOpen()}
            closeDialog={() => closeModal()}
            onInteractOutside={false}
            className='lg:max-w-lg'>
            <DialogBody className='flex flex-col gap-y-4'>
                {isUpdate ? (
                    <p>Update driving license.</p>
                ) : (
                    <p className='mt-4 text-sm leading-snug text-neutral-600'>
                        Your driving license has not yet been verified. <br />
                        Please verify it.
                    </p>
                )}

                <div className='flex justify-end gap-x-4'>
                    <Button type='button' onClick={closeModal}  variant='outline'>
                        Cancel
                    </Button>

                    <Button type='submit' onClick={handleRedirect}  variant='black'>
                        {isUpdate ? 'Update Driving License' : 'Verify Driving License'}
                    </Button>
                </div>
            </DialogBody>
        </Dialog>
    );
}

