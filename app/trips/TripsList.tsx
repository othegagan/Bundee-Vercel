import React from 'react';
import { format } from 'date-fns';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import Link from 'next/link';

const TripsList = ({ tripsData }) => {
    if (!Array.isArray(tripsData) || tripsData.length === 0) {
        return (
            <ErrorComponent
                message='
        There are currently no trips to display.'
            />
        );
    }

    return (
        <div className='grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
            {tripsData.map(trip => (
                <Link
                    key={trip.tripid}
                    href={`/trips/${trip.tripid}`}
                    className='group col-span-1 flex cursor-pointer flex-col gap-4 rounded-md p-3 shadow md:flex-row'>
                    <div className='h-44 w-full overflow-hidden rounded-md bg-neutral-200 group-hover:opacity-75 md:h-full md:w-64'>
                        <img
                            src={trip.vehicleImages[0]?.imagename}
                            alt={`${trip.vehmake} ${trip.vehmodel}`}
                            className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-110 lg:h-full lg:w-full'
                        />
                    </div>

                    <div className='flex flex-auto flex-col'>
                        <div>
                            <h4 className='font-semibold capitalize text-gray-900'>{`${trip.vehmake} ${trip.vehmodel} (${trip.vehyear}`}</h4>
                            <div className='mt-2 flex w-full flex-col gap-2 text-xs text-gray-600'>
                                <div className='flex w-full'>
                                    <div className='w-1/3 space-y-2'>Start Date</div>
                                    <div className='w-2/3 space-y-2 font-medium'>
                                        <>
                                            {/* {format(new Date(trip.starttime), 'LLL dd, y')} | {format(new Date(trip.starttime), 'h:mm a')} */}
                                            {formatDateAndTime(trip.starttime, trip?.vehzipcode)}
                                        </>
                                    </div>
                                </div>
                                <div className='flex w-full'>
                                    <div className='w-1/3 space-y-2'>End Date</div>
                                    <div className='w-2/3 space-y-2 font-medium'>
                                        <>
                                            {formatDateAndTime(trip.endtime, trip?.vehzipcode)}
                                            {/* {format(new Date(trip.endtime), 'LLL dd, y')} | {format(new Date(trip.endtime), 'h:mm a')} */}
                                        </>
                                    </div>
                                </div>
                                <div className='flex w-full'>
                                    <div className='w-1/3 space-y-2'>Pickup</div>
                                    <div className='w-2/3 space-y-2 font-medium'>
                                        <>
                                            {toTitleCase(trip?.vehaddress1)}, {trip?.vehaddress2}, {trip?.vehzipcode}, {trip?.vehcityname}, {trip?.vehstate}
                                        </>
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

export default TripsList;
