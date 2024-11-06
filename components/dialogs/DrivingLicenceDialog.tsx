'use client';

import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Dialog, DialogBody } from '../ui/dialog';

export default function DrivingLicenceDialog() {
    const router = useRouter();
    const { isOpen, isUpdate, onOpen, onClose, onUpdate } = useDrivingLicenceDialog();

    function handleRedirect() {
        router.push(`/driving_licence_verification?callbackUrl=${encodeURIComponent(window.location.href)}`);
        closeModal();
    }

    function closeModal() {
        onClose();
        onUpdate(false);
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
                    <p>Update driving licence.</p>
                ) : (
                    <p className='mt-4 text-neutral-600 text-sm leading-snug'>
                        Your driving licence has not yet been verified. <br />
                        Please verify it.
                    </p>
                )}

                <div className='flex justify-end gap-x-4'>
                    <Button type='button' onClick={closeModal} variant='outline'>
                        Cancel
                    </Button>

                    <Button type='button' onClick={handleRedirect} variant='black'>
                        {isUpdate ? 'Update Driving Licence' : 'Verify Driving Licence'}
                    </Button>
                </div>
            </DialogBody>
        </Dialog>
    );
}
