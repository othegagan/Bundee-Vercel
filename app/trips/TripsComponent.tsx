'use client';
import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsCardsSkeleton } from '@/components/skeletons/skeletons';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import { getTrips } from '@/server/tripOperations';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react';

export default function TripsComponent() {
    const [tabSelectedIndex, setTabSelectedIndex] = useState(0);
    return (
        <BoxContainer className='mb-6 py-6'>
            <div className='flex flex-col gap-1 border-b pb-2 md:flex-row md:items-center md:justify-between'>
                <h3 className='ml-2 text-2xl font-bold leading-6 text-gray-900'>Trips</h3>
                <div
                    role='tablist'
                    aria-orientation='horizontal'
                    className='mt-4 grid h-14 w-full max-w-lg grid-cols-2 items-center justify-center gap-4 rounded-lg bg-neutral-100 p-1 px-3 text-muted-foreground'
                    data-orientation='horizontal'>
                    {['Current Bookings', 'Booking History'].map((title, index) => (
                        <button
                            key={index}
                            onClick={() => setTabSelectedIndex(index)}
                            type='button'
                            role='tab'
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                    ${tabSelectedIndex === index ? 'bg-primary text-white shadow' : 'bg-neutral-100 text-muted-foreground'}`}>
                            {title}
                        </button>
                    ))}
                </div>
            </div>
            <MainComponent tabSelectedIndex={tabSelectedIndex} />
        </BoxContainer>
    );
}

const MainComponent = ({ tabSelectedIndex }: { tabSelectedIndex: number }) => {
    const {
        data: tripsResponse,
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ['trips', { endpoint: tabSelectedIndex === 0 ? 'useridbookings' : 'useridhistory' }],
        queryFn: async () => getTrips(tabSelectedIndex === 0 ? 'useridbookings' : 'useridhistory'),
        refetchOnWindowFocus: true,
    });

    useScrollToTopOnLoad(loading);

    if (loading) {
        return <TripsCardsSkeleton />;
    }

    if (error || !tripsResponse.success) {
        return <ErrorComponent message='Something went wrong in getting trips' />;
    }

    if (tripsResponse.data.activetripresponse.length == 0) {
        return <ErrorComponent message='No trips found.' />;
    }

    return (
        <div className='mt-6 grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6  '>
            {tripsResponse.data?.activetripresponse.map((trip: any, index: React.Key) => (
                <Link
                    key={trip.tripid}
                    href={`/trips/${trip.tripid}`}
                    className='group col-span-1 flex cursor-pointer flex-col gap-4 rounded-md p-3 shadow md:flex-row'>
                    <div className='h-44 w-full overflow-hidden rounded-md bg-neutral-200 group-hover:opacity-75 md:h-48 md:w-64'>
                        <img
                            src={trip.vehicleImages[0]?.imagename}
                            alt={`${trip.vehmake} ${trip.vehmodel}`}
                            className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-110 lg:h-full lg:w-full'
                        />
                    </div>

                    <div className='flex flex-auto flex-col'>
                        <div>
                            <h4 className='text-lg font-semibold capitalize text-gray-900'>{`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`}</h4>
                            <div className='mt-2 flex w-full flex-col gap-2 text-xs text-gray-600'>
                                <div className='flex w-full'>
                                    <div className='w-1/3 space-y-2'>Start Date</div>
                                    <div className='w-2/3 space-y-2 font-medium'>
                                        <>{formatDateAndTime(trip.starttime, trip?.vehzipcode)}</>
                                    </div>
                                </div>
                                <div className='flex w-full'>
                                    <div className='w-1/3 space-y-2'>End Date</div>
                                    <div className='w-2/3 space-y-2 font-medium'>
                                        <>{formatDateAndTime(trip.endtime, trip?.vehzipcode)}</>
                                    </div>
                                </div>
                                <div className='flex w-full'>
                                    <div className='w-1/3 space-y-2'>Pickup</div>
                                    <div className='w-2/3 space-y-2 font-medium'>
                                        {toTitleCase(trip?.vehaddress1)}, {trip?.vehaddress2}, {trip?.vehzipcode}, {trip?.vehcityname}, {trip?.vehstate}
                                    </div>
                                </div>
                                <div className='flex w-full'>
                                    <div className='w-1/3 space-y-2'>Trip Duration</div>
                                    <div className='w-2/3 space-y-2 font-medium'>
                                        <>
                                            {Math.ceil((Number(new Date(trip.endtime)) - Number(new Date(trip.starttime))) / (1000 * 60 * 60 * 24))}
                                            {'  '}
                                            {Math.ceil((Number(new Date(trip.endtime)) - Number(new Date(trip.starttime))) / (1000 * 60 * 60 * 24)) == 1
                                                ? 'Day'
                                                : 'Days'}
                                        </>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='mt-6 flex flex-1 items-end'>
                            <dl className='flex space-x-4 text-sm'>
                                <div>
                                    <div
                                        className={`me-2 rounded px-2.5 py-1 text-sm font-medium dark:text-red-300 ${
                                            {
                                                Approved: 'bg-green-100 text-green-800 dark:bg-green-900',
                                                Completed: 'bg-green-100 text-green-800 dark:bg-green-900',
                                                Requested: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900',
                                                Started: 'bg-blue-100 text-blue-800 dark:bg-blue-900',
                                            }[trip.status] || 'bg-red-100 text-red-800 dark:bg-red-900'
                                        }`}>
                                        {trip.status}
                                    </div>
                                </div>
                                {trip.swapDetails && trip.swapDetails.length > 0 && (
                                    <div className='flex space-x-4 text-sm'>
                                        <div className='h-8 border border-neutral-200'></div>
                                        <div>
                                            {trip.swapDetails[0].statuscode.toLowerCase() === 'swappr' && (
                                                <span className='inline-flex items-center whitespace-nowrap rounded-md bg-yellow-50 p-2 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20'>
                                                    Swap Proposal Requested
                                                </span>
                                            )}
                                            {trip.swapDetails[0].statuscode.toLowerCase() === 'swaprej' && (
                                                <span className='inline-flex items-center whitespace-nowrap rounded-md bg-red-50 p-2 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20'>
                                                    Swap Proposal Rejected
                                                </span>
                                            )}
                                            {trip.swapDetails[0].statuscode.toLowerCase() === 'swapacc' && (
                                                <span className='inline-flex items-center whitespace-nowrap rounded-md bg-green-50 p-2 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20'>
                                                    Swap Proposal Approved
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};
