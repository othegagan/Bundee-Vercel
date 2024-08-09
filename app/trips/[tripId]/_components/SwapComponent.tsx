'use client';

import { Button } from '@/components/ui/button';
import EmblaCarousel from '@/components/ui/carousel/EmblaCarousel';
import { Dialog, DialogBody } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import { swapRequest } from '@/server/tripOperations';
import { getVehicleAllDetailsByVechicleId } from '@/server/vehicleOperations';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FaLocationDot, FaStar } from 'react-icons/fa6';
import { StatusBadge } from '../../TripsComponent';

const SwapComponent = ({ swapRequestDetails, originalStartDate, originalEndDate, zipCode }: any) => {
    const [swapRequestedModalOpen, setSwapRequestedModalOpen] = useState(false);
    const [swapDataLoading, setSwapDataLoading] = useState(false);
    const [vehicleDetails, setVehicleDetails] = useState(null);
    const [vehicleImages, setVehicleImages] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function getSwapVehicleDetails() {
        setSwapDataLoading(true);
        const fetchData = async () => {
            try {
                openModal();
                const id: any = swapRequestDetails.toVehicleId;
                const response = await getVehicleAllDetailsByVechicleId(id);
                if (response.success) {
                    const data = response.data;
                    setVehicleDetails(data.vehicleAllDetails?.[0]);
                    setVehicleImages(data.vehicleAllDetails?.[0]?.imageresponse);
                } else {
                    toast({
                        duration: 3000,
                        variant: 'destructive',
                        description: 'Something went wrong.'
                    });
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error fetching vehicle data data', error);
                setError(error);
            } finally {
                setSwapDataLoading(false);
            }
        };

        fetchData();
    }

    const handleSwapAcceptOrReject = async (statuscode: string) => {
        const data = {
            tripId: swapRequestDetails.tripId,
            userId: swapRequestDetails.userId,
            hostID: swapRequestDetails.hostId,
            statusCode: statuscode,
            toVehicleid: swapRequestDetails.toVehicleId,
            fromVehicleId: swapRequestDetails.fromVehicleId,
            message: 'NA'
        };

        try {
            setLoading(true);
            const response = await swapRequest(data);
            if (response.success) {
                window.location.reload();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Something went wrong.'
                });
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error updating the swap Request', error);
            setError(error);
        } finally {
            setLoading(false);
            setSwapRequestedModalOpen(false);
        }
    };

    function openModal() {
        setSwapRequestedModalOpen(true);
        document.body.style.overflow = 'hidden';
        setLoading(false);
    }

    function closeModal() {
        setSwapRequestedModalOpen(false);
        document.body.style.overflow = '';
        setLoading(false);
    }

    return (
        <div>
            {/* <p className='mt-4 whitespace-nowrap font-bold '>Swap Status</p> */}
            <div className='flex justify-between'>
                <StatusBadge status={swapRequestDetails?.statuscode.toLowerCase()} type='swap' />
                {swapRequestDetails?.statuscode.toLowerCase() === 'swappr' && (
                    <Button onClick={getSwapVehicleDetails} variant='ghost' className='underline underline-offset-4'>
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

                            {vehicleDetails && (
                                <div className=' rounded-md  '>
                                    <div className='group relative cursor-pointer select-none rounded-md border border-neutral-200 bg-white'>
                                        {vehicleImages?.length > 0 ? (
                                            <div className='relative sm:overflow-hidden md:rounded-lg '>
                                                <EmblaCarousel slides={vehicleImages} />
                                            </div>
                                        ) : (
                                            <div className=' embla__slide max-h-80 overflow-hidden md:rounded-md'>
                                                <img
                                                    src='../images/image_not_available.png'
                                                    alt='image_not_found'
                                                    className='h-full w-full min-w-full object-cover md:rounded-md'
                                                />
                                            </div>
                                        )}
                                        <div className='flex w-full flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between'>
                                            <p className='select-text p-0 text-sm font-bold text-neutral-900 '>
                                                {toTitleCase(vehicleDetails?.make)} {vehicleDetails?.model} {vehicleDetails?.year}
                                            </p>

                                            <div className='flex items-center gap-1'>
                                                <p className='text-xs font-medium text-neutral-900 '>{vehicleDetails?.rating}</p>

                                                <FaStar className='mr-2 h-4 w-4 text-yellow-400' />
                                                <p className='text-xs font-medium text-neutral-900 '>({vehicleDetails?.tripcount} Trips)</p>
                                            </div>
                                        </div>

                                        <div className='flex gap-1 p-3 pt-0'>
                                            <FaLocationDot className='-ml-1 inline-block h-4 w-4 text-orange-500' />

                                            <p className='text-xs font-medium  '>
                                                {vehicleDetails?.cityname}, {vehicleDetails?.state}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='flex flex-col gap-2'>
                                <p className='text-sm font-medium'>Trip Dates </p>

                                <div className='inline-flex h-9 w-full  items-center whitespace-nowrap rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors  hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {error ? (
                                        <span className='text-red-500'>{error}</span>
                                    ) : (
                                        <span>
                                            {formatDateAndTime(originalStartDate, zipCode, 'ddd, MMM DD YYYY ')} -{' '}
                                            {formatDateAndTime(originalEndDate, zipCode, 'ddd, MMM DD YYYY ')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className=' relative mt-4 flex gap-x-3'>
                                <div className='text-sm leading-6'>
                                    <p className='text-gray-500'>
                                        Terms and conditions applied.
                                        <Link className='ml-1 underline' href='/privacy'>
                                            <span>Read more about policy</span>
                                        </Link>
                                    </p>
                                </div>
                            </div>

                            <footer className='mt-4 flex items-center  justify-end  gap-4 '>
                                <Button
                                    variant='outline'
                                    onClick={() => {
                                        handleSwapAcceptOrReject('SWAPREJ');
                                    }}
                                    loading={loading}>
                                    No, Reject
                                </Button>
                                <Button
                                    type='button'
                                    onClick={() => {
                                        handleSwapAcceptOrReject('SWAPACC');
                                    }}
                                    disabled={!!error}
                                    loading={loading}>
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
