'use client';

import EmblaCarousel from '@/components/ui/carousel/EmblaCarousel';
import Readmore from '@/components/ui/readmore';
import { formatDateAndTime, getFullAddress, sortImagesByIsPrimary, toTitleCase } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { StatusBadge } from '../../TripsComponent';
import TripImageVideoCarousel from './TripImageVideoCarousel';
import { splitFormattedDateAndTime } from './TripModificationDialog';
import TripPaymentComponent from './TripPaymentComponent';
import TripReadinessChecklistComponent from './TripReadinessChecklistComponent';
import TripPoliciesComponent from './TripPoliciesComponent';
import TripImageVideoUploadComponent from './TripImageVideoUploadComponent';
import { Skeleton } from '@/components/ui/skeleton';

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
    isFetching,
}: TripVehicleDetailsComponentProps) {
    const images: any[] = sortImagesByIsPrimary(trip?.vehicleImages ?? []);

    return (
        <div className='space-y-5'>
            <div className='flex gap-3 md:gap-4'>
                <div className='flex-center size-28 h-20 md:size-36  overflow-hidden rounded-md select-none'>
                    <img
                        src={images[0]?.imagename || '/image_not_available.png'}
                        alt={toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                        className='h-full w-full object-cover object-center'
                    />
                </div>

                <div className='flex flex-1 flex-col '>
                    <div className='text-16  truncate max-w-[200px] font-semibold md:max-w-sm'>
                        {toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                    </div>
                    <div className='text-14 font-medium text-muted-foreground'>{trip?.vehicleNumber}</div>

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
                </div>
            </div>

            {/* Hosted  Section */}
            <div className='relative  flex flex-col gap-2'>
                <div className='flex items-center whitespace-nowrap gap-x-2'>
                    <p className='text-14'>Hosted By:</p>
                    <img src={hostImage || '/dummy_avatar.png'} alt={hostName} className='size-8 rounded-full border bg-neutral-50' />
                    <p className='text-14'>{hostName}</p>
                </div>
                <div className='flex items-center whitespace-nowrap gap-x-2'>
                    <p className='text-14'>Contact Number:</p>
                    <p className='text-14 '>{hostPhoneNumber}</p>
                </div>
            </div>

            {/* Trip Dates Section */}
            <div className='flex flex-col items-center  gap-3   '>
                <div className='flex items-center gap-2 font-semibold text-14'>
                    Trip Duration
                    <span className='font-normal'>
                        ({trip.tripPaymentTokens[0]?.totaldays} {trip?.tripPaymentTokens[0]?.totaldays === 1 ? 'Day' : 'Days'})
                    </span>
                </div>
                <div className='flex w-full justify-between gap-2 '>
                    <p className='text-14 text-center font-semibold'>{splitFormattedDateAndTime(formatDateAndTime(trip.starttime, trip.vehzipcode))}</p>
                    <div className='whitespace-nowrap rounded-full border-primary border p-2 px-2.5 h-fit w-fit font-semibold text-primary/70'>To</div>
                    <p className='text-14 text-center font-semibold'>{splitFormattedDateAndTime(formatDateAndTime(trip.endtime, trip.vehzipcode))}</p>
                </div>
                <div className='flex-center text-14  justify-center gap-2 pt-2 border-t w-full '>
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
            </div>

            {/* Policies */}
            {trip.status.toLowerCase() === 'requested' && <TripPoliciesComponent starttime={trip.starttime} cancellationDays={trip.cancellationDays} />}
        </div>
    );
}
