'use client';

import { Button } from '@/components/ui/button';
import Carousel from '@/components/ui/carousel/carousel';
import { toast } from '@/components/ui/use-toast';
import { toTitleCase } from '@/lib/utils';
import { swapRequest } from '@/server/tripOperations';
import { getVehicleAllDetailsByVechicleId } from '@/server/vehicleOperations';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa6';
import { StatusBadge } from '../../TripsComponent';
import { Dialog, DialogBody } from '@/components/ui/dialog';

const SwapComponent = ({ swapRequestDetails, originalStartDate, originalEndDate }: any) => {
    const [swapRequestedModalOpen, setSwapRequestedModalOpen] = useState(false);
    const [swapDataLoading, setSwaopDataLoading] = useState(false);
    const [vehicleDetails, setvehicleDetails] = useState(null);
    const [vehicleImages, setVehicleImages] = useState(null);
    const [error, setError] = useState('');

    async function handleSwap() {
        setSwaopDataLoading(true);
        const fetchData = async () => {
            try {
                openModal();
                const id: any = swapRequestDetails.toVehicleId;
                const response = await getVehicleAllDetailsByVechicleId(id);
                if (response.success) {
                    const data = response.data;
                    setvehicleDetails(data.vehicleAllDetails?.[0]);
                    setVehicleImages(data.vehicleAllDetails?.[0]?.imageresponse);
                } else {
                    toast({
                        duration: 3000,
                        variant: 'destructive',
                        description: 'Something went wrong.',
                    });
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error fetching vehicle data data', error);
                setError(error);
            } finally {
                setSwaopDataLoading(false);
            }
        };

        fetchData();
    }

    const handleSwapAcceptOrReject = async statuscode => {
        const data = {
            tripId: swapRequestDetails.tripId,
            userId: swapRequestDetails.userId,
            hostID: swapRequestDetails.hostId,
            statusCode: statuscode,
            toVehicleid: swapRequestDetails.toVehicleId,
            fromVehicleId: swapRequestDetails.fromVehicleId,
            message: 'NA',
        };

        try {
            const response = await swapRequest(data);
            if (response.success) {
                window.location.reload();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Something went wrong.',
                });
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error updating the swap Request', error);
            setError(error);
        } finally {
            setSwapRequestedModalOpen(false);
        }
    };

    function openModal() {
        setSwapRequestedModalOpen(true);
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        setSwapRequestedModalOpen(false);
        document.body.style.overflow = '';
    }

    return (
        <div>
            <label className='mt-4 whitespace-nowrap font-bold '>Swap Status</label>
            <div className='flex justify-between'>
                <StatusBadge status={swapRequestDetails?.statuscode.toLowerCase()} type='swap' />
                {swapRequestDetails?.statuscode.toLowerCase() === 'swappr' && (
                    <Button onClick={handleSwap} variant='ghost' className='underline underline-offset-4'>
                        See Swap Details
                    </Button>
                )}
            </div>

            <Dialog isOpen={swapRequestedModalOpen} closeDialog={closeModal} title='Swap Request Proposal'>
                <DialogBody>
                    {!swapDataLoading ? (
                        <div className='flex flex-col gap-3'>
                            {swapRequestDetails.message ? (
                                <div className=' mb-4'>
                                    <p className='text-sm font-medium'>Message from host</p>

                                    <div className='mt-1 rounded-3xl rounded-tl-none bg-primary/10 p-4'>
                                        <p className='text-xs text-black'>{swapRequestDetails.message}</p>
                                    </div>
                                </div>
                            ) : null}

                            <div className=' rounded-md  '>
                                <div className='group relative cursor-pointer select-none rounded-md border border-neutral-200 bg-white'>
                                    <Carousel autoSlide={false}>
                                        {vehicleImages.map((s, i) => (
                                            <img key={i} src={s.imagename} className='max-h-fit rounded-md' alt={`vehicle image ${i}`} />
                                        ))}
                                    </Carousel>
                                    <div className='flex w-full flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between'>
                                        <p className='select-text p-0 text-sm font-bold text-neutral-900 '>
                                            {toTitleCase(vehicleDetails.make)} {vehicleDetails.model} {vehicleDetails.year}
                                        </p>

                                        <div className='flex items-center gap-1'>
                                            <p className='text-xs font-medium text-neutral-900 '>{vehicleDetails.rating}</p>

                                            <FaStar className='mr-2 h-4 w-4 text-yellow-400' />
                                            <p className='text-xs font-medium text-neutral-900 '>({vehicleDetails.tripcount} Bookings)</p>
                                        </div>
                                    </div>

                                    <div className='flex gap-1 p-3 pt-0'>
                                        <svg className='-ml-1 inline-block h-4 w-4 text-orange-500' viewBox='0 0 384 512' fill='currentColor'>
                                            <path d='M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z' />
                                        </svg>
                                        <p className='text-xs font-medium  '>
                                            {vehicleDetails.cityname}, {vehicleDetails.state}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p className='text-sm font-medium'>Pickup & Return </p>

                                <div className='inline-flex h-9 w-full  items-center whitespace-nowrap rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors  hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {error ? (
                                        <span className='text-red-500'>{error}</span>
                                    ) : (
                                        <span>
                                            {format(originalStartDate, 'LLL dd, y')} - {format(originalEndDate, 'LLL dd, y')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className=' relative mt-4 flex gap-x-3'>
                                <div className='text-sm leading-6'>
                                    <p className='text-gray-500'>
                                        Terms and conditions applied.
                                        <span>
                                            <Link className='ml-1 underline' href='/privacy'>
                                                Read more about policy
                                            </Link>
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <footer className='mt-4 flex items-center  justify-end  gap-4 '>
                                <Button
                                    variant='outline'
                                    onClick={() => {
                                        handleSwapAcceptOrReject('SWAPREJ');
                                    }}>
                                    No, Reject
                                </Button>
                                <Button
                                    type='button'
                                    onClick={() => {
                                        handleSwapAcceptOrReject('SWAPACC');
                                    }}
                                    disabled={!!error}>
                                    Yes, Accept
                                </Button>
                            </footer>
                        </div>
                    ) : (
                        <p className='py-6 text-center text-base font-bold'>Swap details Loading...</p>
                    )}
                </DialogBody>
            </Dialog>
        </div>
    );
};

export default SwapComponent;
