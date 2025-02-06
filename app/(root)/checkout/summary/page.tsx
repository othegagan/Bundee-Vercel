'use client';

import { splitFormattedDateAndTime } from '@/app/(root)/trips/[tripId]/_components/TripModificationDialog';
import ErrorComponent from '@/components/custom/ErrorComponent';
import PriceDisplayComponent from '@/components/custom/PriceDisplayComponent';
import { CheckoutDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { formatDateAndTime } from '@/lib/utils';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useCheckoutDetails } from '../useCheckoutDetails';

export default function SummaryPage() {
    const { data, loading, error } = useCheckoutDetails();

    if (error) return <ErrorComponent />;

    if (loading) return <CheckoutDetailsSkeleton />;

    const { name, image, zipCode, startTime, endTime, airportDelivery, totalDays, hostDetails, plate, location, delivery, deliveryCost } = data;

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h2 className='font-bold text-xl'>Summary</h2>
                <p>Please review and confirm your trip.</p>
            </div>
            {/* Content Wrapper */}
            <div className='flex flex-col gap-6 lg:flex-row'>
                {/* Car Image */}
                <div className='space-y-4 lg:w-1/2'>
                    <img src={image || '/images/image_not_available.png'} alt='Mercedes-Benz' className='max-h-48 w-full rounded-lg object-cover' />
                    <div>
                        <h3 className='font-semibold text-lg capitalize'>{name}</h3>
                        <div className='mb-3 text-gray-500 text-sm uppercase'>{plate}</div>
                    </div>
                    <HostDetails hostDetails={hostDetails} />
                </div>
                {/* Booking Details */}
                <div className='space-y-5 lg:w-1/2'>
                    {/* Duration */}

                    <div className='flex w-full flex-col items-stretch justify-around gap-2 rounded-lg bg-primary/10 pb-3 lg:gap-4'>
                        <div className='w-full pt-2 text-center text-14'>
                            Trip duration:{' '}
                            <span className='font-semibold'>
                                ({totalDays} {totalDays === 1 ? 'Day' : 'Days'})
                            </span>
                        </div>
                        <div className='flex w-full justify-around gap-2 lg:justify-around lg:px-8'>
                            <p className='text-center font-semibold text-14'>{splitFormattedDateAndTime(formatDateAndTime(startTime, zipCode))}</p>
                            <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                            <p className='text-center font-semibold text-14'>{splitFormattedDateAndTime(formatDateAndTime(endTime, zipCode))}</p>
                        </div>
                        <div className='w-full flex-center justify-center gap-2 border-t py-2 text-14'>
                            <MapPin className='size-5 text-muted-foreground' />
                            <p className=' max-w-[300px] truncate'>{location}</p>
                        </div>
                    </div>
                    {/* Price Breakdown */}
                    <PriceDisplayComponent
                        pricelist={data}
                        isAirportDeliveryChoosen={airportDelivery}
                        isCustomerDeliveryChoosen={delivery}
                        deliveryCost={deliveryCost}
                    />
                </div>
            </div>
            {/* Confirm Button */}
            <div className=' w-full'>
                <Link href='/checkout/payment'>
                    <Button className='w-full' size='lg'>
                        Confirm Booking
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function HostDetails({ hostDetails }: any) {
    if (!hostDetails) {
        return null;
    }
    return (
        <div className='flex flex-col gap-2'>
            <p className='font-bold'>Hosted By</p>
            <div className='relative flex items-center gap-x-4'>
                <img
                    src={hostDetails.userimage || '/images/dummy_avatar.png'}
                    alt={hostDetails.firstname}
                    className='size-14 rounded-full border bg-neutral-50'
                />
                <div className='space-y-1'>
                    <p className='font-semibold text-neutral-900 capitalize'>
                        {hostDetails.firstname} {hostDetails.lastname}
                    </p>
                    <p className='text-14 text-neutral-600'>Joined on {format(new Date(hostDetails.createddate), 'PP')}</p>
                </div>
            </div>
        </div>
    );
}
