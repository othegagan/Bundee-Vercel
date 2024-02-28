'use client';
import { reservationCancel } from '@/app/_actions/reservation_cancel';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

const CancelTripComponent = ({ tripId }: any) => {
    const [tripCancellationModalOpen, setTripCancellationModalOpen] = useState(false);

    const cancelTrip = async () => {
        try {
            const token = localStorage.getItem('auth_token_login') || '';
            const data = await reservationCancel(tripId, token);
            console.log('cancel trip response', data);
            if (data.errorCode == 0) {
                setTripCancellationModalOpen(false);
                window.location.reload();
            } else {
                // alert('something went wrong, please try again');
                setTripCancellationModalOpen(false);
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
                    setTripCancellationModalOpen(true);
                }}
                variant='destructive'
                size='lg'>
                Cancel
            </Button>

            {tripCancellationModalOpen && (
                <div>
                    <div className='fixed inset-0 z-40 flex items-end bg-black bg-opacity-20 sm:items-center sm:justify-center appear-done enter-done backdrop-blur-[4px]'>
                        <div className='w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg sm:rounded-lg sm:m-4 md:max-w-3xl md:p-7 appear-done enter-done' role='dialog'>
                            <div data-focus-lock-disabled='false'>
                                <header className='flex justify-between gap-2'>
                                    <div>
                                        <h1>Cancel Request</h1>
                                    </div>

                                    <Button
                                        variant='ghost'
                                        className='inline-flex items-center justify-center p-2 text-neutral-600'
                                        aria-label='close'
                                        onClick={() => {
                                            setTripCancellationModalOpen(false);
                                        }}>
                                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20' role='img' aria-hidden='true'>
                                            <path
                                                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                                clipRule='evenodd'
                                                fillRule='evenodd'></path>
                                        </svg>
                                    </Button>
                                </header>
                                <div className='flex justify-center w-full'></div>
                                <div className='sm:col-span-2 mt-4 mb-4'>
                                    <label className='block text-md font-bold  leading-6 text-gray-900'>Are you sure, You would like to cancel this Trip ?</label>
                                </div>

                                <footer className='flex items-center justify-end gap-3  '>
                                    <Button
                                        type='button'
                                        onClick={() => {
                                            setTripCancellationModalOpen(false);
                                        }}
                                        variant='outline'>
                                        Back to Trip
                                    </Button>
                                    <Button type='button' onClick={cancelTrip} variant='destructive'>
                                        Yes, Cancel
                                    </Button>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CancelTripComponent;
