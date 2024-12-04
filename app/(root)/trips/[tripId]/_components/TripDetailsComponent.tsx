'use client';

import PriceDisplayComponent from '@/components/custom/PriceDisplayComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { determineDeliveryType, formatDateAndTime, getFullAddress, sortImagesByIsPrimary, toTitleCase } from '@/lib/utils';
import { AmexLogoIcon, DiscoverLogoIcon, JCBLogoIcon, MasterCardLogoIcon, VisaLogoIcon } from '@/public/icons';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '../../TripsComponent';
import CardChangeDialog from './CardChangeDialog';
import TripImageVideoCarousel from './TripImageVideoCarousel';
import TripImageVideoUploadComponent from './TripImageVideoUploadComponent';
import { splitFormattedDateAndTime } from './TripModificationDialog';
import TripReadinessChecklistComponent from './TripReadinessChecklistComponent';

interface TripVehicleDetailsComponentProps {
    tripData: any;
    driverUploadedImages: any;
    hostUploadedImages: any;
    hostName: string | '';
    hostPhoneNumber: string | '';
    hostImage: string | '';
    isFetching: boolean;
    swapStatus?: string;
}

export default function TripDetailsComponent({
    tripData: trip,
    hostName,
    hostImage,
    hostPhoneNumber,
    isFetching,
    swapStatus
}: TripVehicleDetailsComponentProps) {
    const images: any[] = sortImagesByIsPrimary(trip?.vehicleImages ?? []);

    const { isAirportDeliveryChoosen } = determineDeliveryType(trip);

    function getFullDeliveryAddress(address: any) {
        const parts: string[] = [];

        // Add each part of the address if it exists and is not empty
        if (address.address1) parts.push(address.address1.trim());
        if (address.address2) parts.push(address.address2.trim());
        if (address.cityName) parts.push(address.cityName.trim());
        if (address.state) parts.push(address.state.trim());
        if (address.zipCode) parts.push(address.zipCode.trim());
        if (address.country) parts.push(address.country.trim());

        // Join all the parts with a comma and space
        const fullAddress = parts.join(', ');

        // If the address is still empty, return a default value
        return fullAddress || 'Address information not available';
    }

    return (
        <div className='space-y-5 pb-20 lg:space-y-10'>
            <div className='flex gap-3 md:gap-4'>
                <div className='size-28 h-20 flex-center select-none overflow-hidden rounded-md md:h-36 md:w-56'>
                    <img
                        src={images[0]?.imagename || '/images/image_not_available.png'}
                        alt={toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                        className='h-full w-full object-cover object-center'
                    />
                </div>

                <div className='flex flex-1 flex-col '>
                    <Link
                        className='w-fit max-w-[200px] truncate font-semibold text-16 underline underline-offset-1 md:max-w-sm lg:text-xl'
                        href={`/vehicles/${trip.vehicleId}`}>
                        {toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                    </Link>
                    <div className='font-normal text-14 text-muted-foreground lg:text-xl'>{trip?.vehicleNumber}</div>
                    <div className='my-2 flex-center justify-between'>
                        {isFetching ? (
                            <Skeleton className='h-8 w-28 rounded-lg bg-neutral-200' />
                        ) : (
                            <div className='flex items-center gap-2'>
                                <StatusBadge status={trip.status.toLowerCase()} type='trip' />
                                {swapStatus && <StatusBadge status={swapStatus.toLowerCase()} type='swap' />}
                            </div>
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
            <div className='flex w-full flex-col items-center justify-center gap-2 rounded-lg '>
                <div className='flex w-full justify-around gap-2 lg:justify-around lg:px-16'>
                    <p className='text-center font-semibold text-14'>{splitFormattedDateAndTime(formatDateAndTime(trip.starttime, trip.vehzipcode))}</p>
                    <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                    <p className='text-center font-semibold text-14'>{splitFormattedDateAndTime(formatDateAndTime(trip.endtime, trip.vehzipcode))}</p>
                </div>
                <div className='w-full border-t pt-2 text-center text-14'>
                    Trip duration:{' '}
                    <span className='font-semibold'>
                        ({trip.tripPaymentTokens[0]?.totaldays} {trip?.tripPaymentTokens[0]?.totaldays === 1 ? 'Day' : 'Days'})
                    </span>
                </div>

                {trip.delivery || trip.airportDelivery ? (
                    <div className='w-full flex-center justify-center gap-2 text-14 '>
                        <MapPin className='size-5 text-muted-foreground' />
                        <p>Custom Delivery Location : {getFullDeliveryAddress(trip?.deliveryLocations[0])}</p>
                    </div>
                ) : (
                    <div className='w-full flex-center justify-center gap-2 text-14 '>
                        <MapPin className='size-5 text-muted-foreground' />
                        <p className=' max-w-[300px] truncate'>{getFullAddress({ tripDetails: trip })}</p>
                    </div>
                )}
            </div>

            {/* Payment Section */}
            <PriceDisplayComponent pricelist={trip?.tripPaymentTokens[0]} isAirportDeliveryChoosen={isAirportDeliveryChoosen} invoiceUrl={trip.invoiceUrl}>
                {trip?.cardDetails?.length > 0 && (
                    <div className='mb-2 flex flex-wrap items-center gap-1 font-normal md:justify-between'>
                        <div className='flex flex-wrap items-center gap-1'>
                            Paid using
                            <CardBrandIcon cardType={trip?.cardDetails[0]?.cardBrand} />
                            <span className='capitalize'>{trip?.cardDetails[0]?.cardBrand}</span>(
                            {trip?.cardDetails[0]?.cardType === 'debit' ? 'Debit Card' : 'Credit Card'}) ending
                            <span className='text-neutral-700'>••••</span> {trip?.cardDetails[0]?.last4Digit}
                        </div>
                        {!['cancelled', 'completed', 'rejected', 'cancellation requested'].includes(trip.status.toLowerCase()) && (
                            <CardChangeDialog tripId={Number(trip.tripid)} />
                        )}
                    </div>
                )}
            </PriceDisplayComponent>

            {/* Readiness Checklist Section */}
            {trip.status.toLowerCase() !== 'completed' && trip.status.toLowerCase() !== 'cancelled' && trip.status.toLowerCase() !== 'rejected' && (
                <TripReadinessChecklistComponent trip={trip} />
            )}

            {/* Trip Media */}
            <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                    <div className='font-bold text-md '>Trip Media</div>
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
            {/* {trip.status.toLowerCase() === 'requested' && <TripPoliciesComponent starttime={trip.starttime} cancellationDays={trip.cancellationDays} />} */}
        </div>
    );
}

function HostDetails({ hostName, hostImage, hostPhoneNumber }: { hostName: string; hostImage: string; hostPhoneNumber: string }) {
    return (
        <div className='relative flex flex-col '>
            <div className='flex items-center gap-x-2 whitespace-nowrap'>
                <p className='text-14 md:text-16'>Hosted By:</p>
                <img src={hostImage || '/images/dummy_avatar.png'} alt={hostName} className='size-8 rounded-full border bg-neutral-50' />
                <p className='text-16'>{hostName}</p>
            </div>
            <div className='flex items-center gap-x-2 whitespace-nowrap'>
                <p className='text-14 md:text-16'>Contact Number:</p>
                <p className='text-14 md:text-16 '>{hostPhoneNumber}</p>
            </div>
        </div>
    );
}

function CardBrandIcon({ cardType }: { cardType: string }) {
    switch (cardType.toLowerCase()) {
        case 'visa':
            return <VisaLogoIcon className='h-5 w-6' />;
        case 'mastercard':
            return <MasterCardLogoIcon className='h-5 w-6' />;
        case 'amex':
            return <AmexLogoIcon className='h-5 w-6' />;
        case 'discover':
            return <DiscoverLogoIcon className='h-5 w-6' />;
        case 'jcb':
            return <JCBLogoIcon className='h-5 w-6' />;
        default:
            return null;
    }
}
