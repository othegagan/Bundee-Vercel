'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { cancelReservation } from '@/server/tripOperations';
import { useState } from 'react';

const CancelTripComponent = ({ tripId }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    function openModal() {
        setIsModalOpen(true);
    }
    function closeModal() {
        setIsModalOpen(false);
    }

    const cancelTrip = async () => {
        try {
            setLoading(true);
            const response = await cancelReservation(tripId);
            if (response.success) {
                closeModal();
                toast({
                    duration: 3000,
                    variant: 'success',
                    description: 'Trip cancellation completed.',
                });
                window.location.reload();
            } else {
                closeModal();
                // alert('something went wrong, please try again');
                // window.location.reload();
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Something went wrong, please try again.',
                });
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error cancelling the trip', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => {
                    openModal();
                }}
                variant='destructive'
                className='w-full'
                size='lg'>
                Cancel trip
            </Button>

            <Dialog isOpen={isModalOpen} openDialog={openModal} closeDialog={closeModal} title='Cancel Request'>
                <DialogBody>
                    <p>Are you sure, You would like to cancel this Trip ?</p>
                </DialogBody>
                <DialogFooter>
                    <Button type='button' variant='outline' disabled={loading} onClick={closeModal} className='w-full sm:w-auto '>
                        Back to Trip
                    </Button>

                    <Button type='button' variant='black' className='w-full sm:w-auto ' loading={loading} loadingText='Cancelling...' onClick={cancelTrip}>
                        Cancel Trip
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default CancelTripComponent;