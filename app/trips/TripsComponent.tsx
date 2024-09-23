'use client';

import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsCardsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import { cn, formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import { getTrips } from '@/server/tripOperations';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export default function TripsComponent() {
    const [tabSelectedIndex, setTabSelectedIndex] = useState(0);
    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });
    return (
        <BoxContainer className='mb-6'>
            <div className='mx-auto flex select-none flex-col gap-1 border-b md:flex-row md:items-center md:justify-center'>
                <div
                    role='tablist'
                    aria-orientation='horizontal'
                    className='mx-auto mt-4 grid w-fit max-w-lg grid-cols-2 items-center justify-center gap-10 rounded-lg text-muted-foreground'
                    data-orientation='horizontal'>
                    {[
                        { id: 0, title: 'Trips' },
                        { id: 1, title: 'Past Trips' }
                    ].map(({ id, title }) => (
                        <button
                            key={id}
                            onClick={() => setTabSelectedIndex(id)}
                            type='button'
                            role='tab'
                            className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 font-medium text-md ring-offset-background transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${tabSelectedIndex === id ? 'font-bold text-lg text-primary ' : 'font-medium text-muted-foreground'}`}>
                            {title}
                        </button>
                    ))}
                </div>
            </div>
            <MainComponent tabSelectedIndex={tabSelectedIndex} isTabletOrLarger={isTabletOrLarger} />
        </BoxContainer>
    );
}

const MainComponent = ({ tabSelectedIndex, isTabletOrLarger }: { tabSelectedIndex: number; isTabletOrLarger: boolean }) => {
    const router = useRouter();

    const {
        data: tripsResponse,
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['trips', { endpoint: tabSelectedIndex === 0 ? 'useridbookings' : 'useridhistory' }],
        queryFn: async () => getTrips(tabSelectedIndex === 0 ? 'useridbookings' : 'useridhistory'),
        refetchOnWindowFocus: true
    });

    useScrollToTopOnLoad(loading);

    if (loading) {
        return <TripsCardsSkeleton />;
    }

    if (error || !tripsResponse.success) {
        return <ErrorComponent message='Something went wrong in getting trips' />;
    }

    if (tripsResponse.data.activetripresponse.length === 0) {
        return <ErrorComponent message='No trips found.' />;
    }

    return (
        <div className='mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 '>
            {tripsResponse.data?.activetripresponse.map((trip: any) => {
                if (isTabletOrLarger) {
                    return (
                        <Link
                            key={trip.tripid}
                            href={`/trips/${trip.tripid}/details`}
                            className='flex w-full flex-1 gap-4 border-b p-1 hover:cursor-pointer hover:rounded-md hover:bg-neutral-100 md:py-3'>
                            <div className='size-32 h-full flex-center overflow-hidden rounded-md'>
                                <img
                                    src={trip.vehicleImages[0]?.imagename || '/images/image_not_available.png'}
                                    alt={`${trip.vehmake} ${trip.vehmodel}`}
                                    className='h-full w-full object-cover object-center'
                                />
                            </div>

                            <div className='flex w-full flex-1 flex-col gap-2 '>
                                <div className='flex w-full items-center justify-between'>
                                    <div className='max-w-[200px] truncate font-bold text-[18px] md:max-w-sm'>
                                        {toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                                        <div className='font-medium text-14 text-muted-foreground '>{trip?.vehicleNumber}</div>
                                    </div>
                                    <div className='mt-2 flex-center justify-between gap-6'>
                                        <StatusBadge status={trip.status} type='trip' />
                                        {trip.swapDetails && trip.swapDetails.length > 0 && <StatusBadge status={trip.swapDetails[0].statuscode} type='swap' />}
                                    </div>
                                </div>

                                <div className='flex w-full items-center gap-2'>
                                    <CalendarDays className='size-4 ' />
                                    <div className='text-14 '>
                                        {formatDateAndTime(trip?.starttime, trip?.vehzipcode, 'ddd, MMM DD YYYY')} -{' '}
                                        {formatDateAndTime(trip?.endtime, trip?.vehzipcode, 'ddd, MMM DD YYYY')}
                                    </div>
                                </div>

                                <div className='flex-center justify-start gap-2 text-14'>
                                    <MapPin className='size-4 ' />
                                    <p className=' max-w-[300px] truncate md:max-w-[400px]'>{getFullAddress({ tripDetails: trip })}</p>
                                </div>

                                <div className='-mt-6 flex items-center justify-end gap-10 pl-1.5'>
                                    {/* {['approved', 'started', 'requested'].indexOf(trip.status.toLowerCase()) !== -1 && (
                                        <Button variant='link' className='px-0 flex items-center gap-2 text-secondary-foreground font-semibold'>
                                            <img src='/icons/edit_document.svg' alt='edit' width={18} height={18} />
                                            Modify Trip
                                        </Button>
                                    )} */}
                                    <Button
                                        onClick={() => router.push(`/trips/${trip.tripid}/details`)}
                                        variant='link'
                                        className='flex items-center gap-2 px-0 font-semibold text-secondary-foreground'>
                                        <img src='/icons/chat.svg' alt='chat' width={18} height={18} />
                                        Message Host
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    );
                }

                return (
                    <Link
                        key={trip.tripid}
                        href={`/trips/${trip.tripid}/details`}
                        className='flex gap-2 border-b p-1 hover:cursor-pointer hover:rounded-md hover:bg-neutral-100 md:p-2'>
                        <div className='flex flex-1 flex-col gap-2 text-nowrap md:flex-row'>
                            <div className='flex gap-3 md:gap-4'>
                                <div className='size-28 h-16 flex-center select-none overflow-hidden rounded-md'>
                                    <img
                                        src={trip.vehicleImages[0]?.imagename || '/images/image_not_available.png'}
                                        alt={`${trip.vehmake} ${trip.vehmodel}`}
                                        className='h-full w-full object-cover object-center'
                                    />
                                </div>

                                <div className='flex flex-1 flex-col '>
                                    <div className='max-w-[200px] truncate font-semibold text-16 md:max-w-sm'>
                                        {toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                                    </div>

                                    <div className='flex-center flex-wrap justify-between gap-2'>
                                        <div className='font-medium text-14 text-muted-foreground'>{trip?.vehicleNumber}</div>
                                        <StatusBadge status={trip.status} type='trip' />
                                        {trip.swapDetails && trip.swapDetails.length > 0 && <StatusBadge status={trip.swapDetails[0].statuscode} type='swap' />}
                                    </div>
                                </div>
                            </div>

                            <div className='flex w-full items-center gap-2'>
                                <CalendarDays className='size-5 text-muted-foreground' />
                                <div className='text-14 '>
                                    {formatDateAndTime(trip.starttime, trip?.vehzipcode, 'ddd, MMM DD YYYY')} -{' '}
                                    {formatDateAndTime(trip.endtime, trip?.vehzipcode, 'ddd, MMM DD YYYY')}
                                </div>
                            </div>

                            <div className='mt-1.5 flex-center justify-start gap-2 text-14'>
                                <MapPin className='size-5 text-muted-foreground' />
                                <p className=' max-w-[300px] truncate'>{getFullAddress({ tripDetails: trip })}</p>
                            </div>

                            <div className='flex w-full items-center justify-between '>
                                {/* {['approved', 'started', 'requested'].indexOf(trip.status.toLowerCase()) !== -1 && (
                                        <Button variant='link' className='px-0 flex items-center gap-2 text-secondary-foreground font-semibold'>
                                            <img src='/icons/edit_document.svg' alt='edit' width={18} height={18} />
                                            Modify Trip
                                        </Button>
                                    )} */}
                                <Button
                                    onClick={() => router.push(`/trips/${trip.tripid}/details?messages=true`)}
                                    variant='link'
                                    className='ml-auto flex items-center gap-2 px-0 font-semibold text-secondary-foreground'>
                                    <img src='/icons/chat.svg' alt='chat' width={18} height={18} />
                                    Message Host
                                </Button>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export const StatusBadge = ({ status, type, className }: { type: 'trip' | 'swap'; status: string; className?: string }) => {
    const statusTexts = {
        swap: {
            swappr: 'Swap Proposal Requested',
            swaprej: 'Swap Proposal Rejected',
            swapacc: 'Swap Proposal Approved',
            default: 'Unknown Status'
        }
    };

    const getStatusText = (type: string, status: string) => {
        return statusTexts[type]?.[status.toLowerCase()] || status;
    };

    const statusText = getStatusText(type, status);

    return (
        <div className={cn('inline-flex items-center whitespace-nowrap bg-[#0A4AC61A] px-2.5 py-1.5 font-bold text-12 capitalize', className)}>
            {statusText}
        </div>
    );
};
