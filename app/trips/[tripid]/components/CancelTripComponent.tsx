'use client';

import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/custom/modal';
import { Label } from '@/components/ui/label';
import { cancelReservation } from '@/server/tripOperations';
import { toast } from '@/components/ui/use-toast';
import { LuLoader2 } from 'react-icons/lu';

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
            console.error('Error cencelling the trip', error);
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

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalHeader onClose={closeModal}>Cancel Request</ModalHeader>
                <ModalBody>
                    <Label>Are you sure, You would like to cancel this Trip ?</Label>
                </ModalBody>
                <ModalFooter className='flex '>
                    <div className='ml-auto flex justify-end gap-4'>
                        <Button type='button' variant='outline' disabled={loading} onClick={closeModal} className='w-full sm:w-auto '>
                            Back to Trip
                        </Button>

                        <Button type='button' variant='black' className='w-full sm:w-auto ' disabled={loading} onClick={cancelTrip}>
                            {loading ? (
                                <div className='flex items-center gap-3'>
                                    <LuLoader2 className='h-4 w-4 animate-spin text-white' />
                                    Cancelling...
                                </div>
                            ) : (
                                'Cancel Trip'
                            )}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default CancelTripComponent;
