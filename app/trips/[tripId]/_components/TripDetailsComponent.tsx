'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { formatDateAndTime, getFullAddress, sortImagesByIsPrimary, toTitleCase } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '../../TripsComponent';
import TripImageVideoCarousel from './TripImageVideoCarousel';
import TripImageVideoUploadComponent from './TripImageVideoUploadComponent';
import { splitFormattedDateAndTime } from './TripModificationDialog';
import TripPaymentComponent from './TripPaymentComponent';
import TripPoliciesComponent from './TripPoliciesComponent';
import TripReadinessChecklistComponent from './TripReadinessChecklistComponent';

interface TripVehicleDetailsComponentProps {
    tripData: any;
    driverUploadedImages: any;
    hostUploadedImages: any;
    hostName: string | '';
    hostPhoneNumber: string | '';
    hostImage: string | '';
    isFetching: boolean;
}

export default function TripDetailsComponent({
    tripData: trip,
    driverUploadedImages,
    hostUploadedImages,
    hostName,
    hostImage,
    hostPhoneNumber,
    isFetching
}: TripVehicleDetailsComponentProps) {
    const images: any[] = sortImagesByIsPrimary(trip?.vehicleImages ?? []);

    return (
        <div className='space-y-5 lg:space-y-10'>
            <div className='flex gap-3 md:gap-4'>
                <div className='flex-center size-28 h-20 md:size-36  overflow-hidden rounded-md select-none'>
                    <img
                        src={images[0]?.imagename || '/images/image_not_available.png'}
                        alt={toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                        className='h-full w-full object-cover object-center'
                    />
                </div>

                <div className='flex flex-1 flex-col '>
                    <Link
                        className='text-16  truncate max-w-[200px] font-semibold md:max-w-sm lg:text-xl underline underline-offset-1 w-fit'
                        href={`/vehicles/${trip.vehicleId}`}>
                        {toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                    </Link>
                    <div className='text-14 font-normal text-muted-foreground lg:text-xl'>{trip?.vehicleNumber}</div>

                    <div className='flex-center justify-between mt-3'>
                        {isFetching ? (
                            <Skeleton className='h-8 w-28 rounded-lg bg-neutral-200' />
                        ) : (
                            <StatusBadge status={trip.status.toLowerCase()} type='trip' />
                        )}
                        {trip.swapDetails && trip.swapDetails.length > 0 && (
                            <StatusBadge status={trip.swapDetails[0].statuscode} type='swap' className='ml-auto' />
                        )}
                    </div>

                    <div className='hidden lg:block'>
                        <HostDetails hostName={hostName} hostImage={hostImage} hostPhoneNumber={hostPhoneNumber} />
                    </div>
                </div>
            </div>

            {/* Hosted  Section */}
            <div className='lg:hidden'>
                <HostDetails hostName={hostName} hostImage={hostImage} hostPhoneNumber={hostPhoneNumber} />
            </div>

            {/* Trip Dates Section */}
            <div className='flex flex-col items-center justify-center gap-2 rounded-lg  w-full '>
                <div className='flex w-full justify-around gap-2 lg:px-16 lg:justify-around'>
                    <p className='text-14 text-center font-semibold'>{splitFormattedDateAndTime(formatDateAndTime(trip.starttime, trip.vehzipcode))}</p>
                    <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                    <p className='text-14 text-center font-semibold'>{splitFormattedDateAndTime(formatDateAndTime(trip.endtime, trip.vehzipcode))}</p>
                </div>
                <div className='text-14  pt-2 border-t w-full text-center'>
                    Trip duration:{' '}
                    <span className='font-semibold'>
                        ({trip.tripPaymentTokens[0]?.totaldays} {trip?.tripPaymentTokens[0]?.totaldays === 1 ? 'Day' : 'Days'})
                    </span>
                </div>
                <div className='flex-center text-14  justify-center gap-2 w-full '>
                    <MapPin className='size-5 text-muted-foreground' />
                    <p className=' max-w-[300px] truncate'>{getFullAddress({ tripDetails: trip })}</p>
                </div>
            </div>

            {/* Payment Section */}
            <TripPaymentComponent pricelist={trip?.tripPaymentTokens[0]} trip={trip} />

            {/* Readiness Checklist Section */}
            <TripReadinessChecklistComponent trip={trip} />

            {/* Trip Media */}
            <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                    <div className='text-md font-bold '>Trip Media</div>
                    <TripImageVideoUploadComponent
                        tripid={trip.tripid}
                        userId={trip.userid}
                        hostId={trip.hostid}
                        driverTripStartingBlobs={trip?.driverTripStartingBlobs || []}
                    />
                </div>
                <TripImageVideoCarousel images={trip?.driverTripStartingBlobs || []} uploadedBy='driver' />
                <TripImageVideoCarousel images={trip?.hostTripStartingBlobs || []} uploadedBy='host' />
            </div>

            {/* Policies */}
            {trip.status.toLowerCase() === 'requested' && <TripPoliciesComponent starttime={trip.starttime} cancellationDays={trip.cancellationDays} />}
        </div>
    );
}

function HostDetails({ hostName, hostImage, hostPhoneNumber }: { hostName: string; hostImage: string; hostPhoneNumber: string }) {
    return (
        <div className='relative flex flex-col '>
            <div className='flex items-center whitespace-nowrap gap-x-2'>
                <p className='text-14 md:text-16'>Hosted By:</p>
                <img src={hostImage || '/images/dummy_avatar.png'} alt={hostName} className='size-8 rounded-full border bg-neutral-50' />
                <p className='text-16'>{hostName}</p>
            </div>
            <div className='flex items-center whitespace-nowrap gap-x-2'>
                <p className='text-14 md:text-16'>Contact Number:</p>
                <p className='text-14 md:text-16 '>{hostPhoneNumber}</p>
            </div>
        </div>
    );
}
