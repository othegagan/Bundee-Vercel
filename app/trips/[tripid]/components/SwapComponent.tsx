'use client';

import { Button } from '@/components/ui/button';
import Carousel from '@/components/ui/carousel/carousel';
import { toast } from '@/components/ui/use-toast';
import { swapRequest } from '@/server/tripOperations';
import { getVehicleAllDetailsByVechicleId } from '@/server/vehicleOperations';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

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
                setSwapRequestedModalOpen(true);
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

    return (
        <div>
            <div className='mt-4 flex justify-between'>
                <label className='whitespace-nowrap font-bold'>Swap Status</label>
                <div className='whitespace-nowrap'>
                    {swapRequestDetails?.statuscode.toLowerCase() === 'swappr' && (
                        <span className='mx-4 inline-flex items-center rounded-md bg-yellow-50 p-2 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20'>
                            Swap Proposal Requested
                        </span>
                    )}

                    {swapRequestDetails?.statuscode.toLowerCase() === 'swaprej' && (
                        <span className='mx-4 inline-flex items-center rounded-md bg-red-50 p-2 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20'>
                            Swap Proposal Requested
                        </span>
                    )}

                    {swapRequestDetails?.statuscode.toLowerCase() === 'swapacc' && (
                        <span className='mx-4 inline-flex items-center rounded-md bg-green-50 p-2 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20'>
                            Swap Proposal Approved
                        </span>
                    )}
                </div>

                {swapRequestDetails?.statuscode.toLowerCase() === 'swappr' && (
                    <Button onClick={handleSwap} variant='ghost' className='underline underline-offset-4'>
                        See Details
                    </Button>
                )}
            </div>

            {swapRequestedModalOpen && (
                <div>
                    <div className='appear-done enter-done fixed inset-0 z-40 flex items-end bg-black bg-opacity-20 backdrop-blur-[4px] sm:items-center sm:justify-center'>
                        <div
                            className='appear-done enter-done w-full overflow-hidden rounded-t-lg bg-white px-6 py-4 sm:m-4 sm:rounded-lg md:max-w-xl md:p-7'
                            role='dialog'>
                            <div data-focus-lock-disabled='false'>
                                <div className='flex flex-col gap-3'>
                                    <header className='flex justify-between gap-2'>
                                        <div>
                                            <h1>Swap Request Proposal from Host</h1>
                                        </div>

                                        <Button
                                            variant='ghost'
                                            className='inline-flex items-center justify-center p-2 text-neutral-600'
                                            aria-label='close'
                                            onClick={() => {
                                                setSwapRequestedModalOpen(false);
                                            }}>
                                            <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20' role='img' aria-hidden='true'>
                                                <path
                                                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                                    clipRule='evenodd'
                                                    fillRule='evenodd'></path>
                                            </svg>
                                        </Button>
                                    </header>

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

                                            <div className=' rounded-sm border '>
                                                <div className='group relative cursor-pointer select-none rounded-md border border-neutral-200 bg-white'>
                                                    <Carousel autoSlide={false}>
                                                        {vehicleImages.map((s, i) => (
                                                            <img key={i} src={s.imagename} className='max-h-fit' alt={`vehicle image ${i}`} />
                                                        ))}
                                                    </Carousel>
                                                    <div className='flex items-center justify-between gap-3 p-3'>
                                                        <div className='space-y-1'>
                                                            <p className='select-text p-0 text-sm font-bold text-neutral-900 '>
                                                                {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.year}
                                                            </p>

                                                            <div className='flex items-center gap-1'>
                                                                <p className='text-xs font-medium text-neutral-900 '>{vehicleDetails.rating}</p>

                                                                <svg
                                                                    className='mr-2 h-4 w-4 text-yellow-300'
                                                                    aria-hidden='true'
                                                                    xmlns='http://www.w3.org/2000/svg'
                                                                    fill='currentColor'
                                                                    viewBox='0 0 22 22'>
                                                                    <path d='M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z' />
                                                                </svg>
                                                                <p className='text-xs font-medium text-neutral-900 '>({vehicleDetails.tripcount} Trips)</p>
                                                            </div>

                                                            <div className='flex gap-1'>
                                                                <svg
                                                                    className='-ml-1 inline-block h-4 w-4 text-orange-500'
                                                                    viewBox='0 0 384 512'
                                                                    fill='currentColor'>
                                                                    <path d='M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z' />
                                                                </svg>
                                                                <p className='text-xs font-medium  '>
                                                                    {vehicleDetails.cityname}, {vehicleDetails.state}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {/* <p className='text-base font-medium text-neutral-900'>${vehicleDetails.price_per_hr}/Day</p> */}
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
                                                                Read More About Policy
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SwapComponent;
