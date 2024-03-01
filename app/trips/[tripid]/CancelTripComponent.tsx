'use client';
import { reservationCancel } from '@/app/_actions/reservation_cancel';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/custom/modal';
import { Label } from '@/components/ui/label';

const CancelTripComponent = ({ tripId }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    function openModal() {
        setIsModalOpen(true);
    }
    function closeModal() {
        setIsModalOpen(false);
    }

    const cancelTrip = async () => {
        try {
            const token = localStorage.getItem('auth_token_login') || '';
            const data = await reservationCancel(tripId, token);
            console.log('cancel trip response', data);
            if (data.errorCode == 0) {
                closeModal();
                window.location.reload();
            } else {
                closeModal();
                // alert('something went wrong, please try again');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error cencelling the trip', error);
        } finally {
        }
    };

    return (
        <>
            <Button
                onClick={() => {
                    openModal();
                }}
                variant='destructive'
                size='lg'>
                Cancel
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalHeader onClose={closeModal}>Cancel Request</ModalHeader>
                <ModalBody>
                    <Label>Are you sure, You would like to cancel this Trip ?</Label>
                </ModalBody>
                <ModalFooter className='flex '>
                    <div className='flex justify-end gap-4 ml-auto'>
                        <Button type='button' variant='outline' onClick={closeModal} className='w-full sm:w-auto '>
                            Back to Trip
                        </Button>

                        <Button type='button' variant='black' className='w-full sm:w-auto ' onClick={cancelTrip}>
                            Cancel Trip
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default CancelTripComponent;
