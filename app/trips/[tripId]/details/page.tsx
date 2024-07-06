'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { shimmer, VehiclesDetailsSkeleton } from '@/components/skeletons/skeletons';
import { useTripDetails } from '@/hooks/useTripDetails';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import { StatusBadge } from '../../TripsComponent';
import CancelTripComponent from '../_components/CancelTripComponent';
import DocumentHandlerComponent from '../_components/DocumentHandlerComponent';
import FreeCancellationDate from '../_components/FreeCancellationDate';
import StartTripComponent from '../_components/StartTripComponent';
import SwapComponent from '../_components/SwapComponent';
import TripImageVideoUploadComponent from '../_components/TripImageVideoUploadComponent';
import TripModificationDialog from '../_components/TripModificationDialog';
import TripPriceListComponent from '../_components/TripPriceListComponent';
import TripReviewDialogTrigger from '../_components/TripReviewDialogTrigger';
import TripVehicleDetailsComponent from '../_components/TripVehicleDetailsComponent';
import { Skeleton } from '@/components/ui/skeleton';

export default function page({ params }: { params: { tripId: string } }) {
    const { data: response, isLoading, error, isFetching } = useTripDetails(params.tripId);

    if (isLoading) {
        return <VehiclesDetailsSkeleton />;
    }

    if (error || !response?.success) {
        return <ErrorComponent />;
    }

    const tripData = response?.data?.activetripresponse[0];
    const tripRating = response?.data?.tripreview;
    const swapRequestDetails = tripData?.swapDetails[0];

    return (
        <div className='mt-3 grid grid-cols-1 gap-6 md:mt-6 md:grid-cols-2 md:gap-6 lg:grid-cols-5'>
            <div className='flex flex-col lg:col-span-3'>
                <TripVehicleDetailsComponent
                    car={tripData.vehicleDetails[0]}
                    driverUploadedImages={tripData.driverTripStartingBlobs}
                    hostUploadedImages={tripData.hostTripStartingBlobs}
                    hostName={`${tripData?.hostFirstName} ${tripData?.hostLastName}` || ''}
                    hostPhoneNumber={tripData?.hostPhoneNumber || ''}
                    hostImage={tripData?.hostImage || ''}
                />
            </div>

            <div className='mt-4 px-4 lg:col-span-2 lg:mt-0'>
                <TripImageVideoUploadComponent tripData={tripData} />

                <div className='mt-10 flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                        <div className='text-md'>Trip Duration</div>
                        <div className='text-md font-medium'>
                            {tripData.tripPaymentTokens[0]?.totaldays} {tripData?.tripPaymentTokens[0]?.totaldays === 1 ? 'Day' : 'Days'}
                        </div>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='text-md'> Start Date</div>
                        <div className='text-md font-medium'>{formatDateAndTime(tripData.starttime, tripData.vehzipcode)}</div>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='text-md'> End Date</div>
                        <div className='text-md font-medium'>{formatDateAndTime(tripData.endtime, tripData.vehzipcode)}</div>
                    </div>

                    <div className='flex items-center justify-between'>
                        <div className='text-md'>Pickup & Return</div>
                        <div className='text-md font-medium'>
                            {tripData?.vehaddress1 ? `${toTitleCase(tripData?.vehaddress1)}, ` : null}
                            {tripData?.vehaddress2 ? `${toTitleCase(tripData?.vehaddress2)}, ` : null}
                            {tripData?.vehcity ? `${toTitleCase(tripData?.vehcity)}, ` : null}
                            {tripData?.vehstate ? `${toTitleCase(tripData?.vehstate)}, ` : null}
                            {tripData?.vehzipcode ? `${tripData?.vehzipcode}` : null}
                        </div>
                    </div>

                    <TripPriceListComponent pricelist={tripData?.tripPaymentTokens[0]} />

                    <div className=' flex justify-between'>
                        <label className='text-15 font-bold'>Trip Status</label>
                        {isFetching ? (
                            <Skeleton className='h-8 w-28 rounded-lg bg-neutral-200' />
                        ) : (
                            <StatusBadge status={tripData.status.toLowerCase()} type='trip' />
                        )}
                    </div>

                    {swapRequestDetails && (
                        <SwapComponent
                            swapRequestDetails={swapRequestDetails}
                            originalStartDate={new Date(tripData.starttime)}
                            originalEndDate={new Date(tripData.endtime)}
                        />
                    )}

                    {tripData.status.toLowerCase() === 'requested' && <FreeCancellationDate tripData={tripData} />}

                    {tripData.isRentalAgreed && (
                        <DocumentHandlerComponent
                            isRentalAgreed={tripData.isRentalAgreed}
                            tripId={tripData.tripid}
                            rentalAgrrementUrl={tripData.rentalAgrrementUrl}
                            rentalAgreedDate={tripData.rentalAgreedDate}
                        />
                    )}
                </div>

                {!tripData.isRentalAgreed && ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripData.status.toLowerCase()) === -1 ? (
                    <DocumentHandlerComponent
                        isRentalAgreed={tripData.isRentalAgreed}
                        tripId={tripData.tripid}
                        rentalAgrrementUrl={tripData.rentalAgrrementUrl}
                        rentalAgreedDate={tripData.rentalAgreedDate}
                    />
                ) : (
                    <div className='mt-10 grid w-full grid-cols-2  gap-3'>
                        {tripData.status.toLowerCase() === 'approved' && swapRequestDetails?.statuscode.toLowerCase() !== 'swappr' && (
                            <StartTripComponent starttime={tripData.starttime} tripid={tripData.tripid} key={tripData.tripid} />
                        )}
                    </div>
                )}

                <div className='mt-6 grid w-full grid-cols-2  gap-3'>
                    {['approved', 'started', 'requested'].indexOf(tripData.status.toLowerCase()) !== -1 && <TripModificationDialog tripData={tripData} />}

                    {['started', 'cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripData.status.toLowerCase()) === -1 && (
                        <CancelTripComponent tripId={tripData.tripid} />
                    )}
                </div>

                {tripData.invoiceUrl && (
                    <DocumentHandlerComponent isRentalAgreed={tripData.isRentalAgreed} tripId={tripData.tripid} invoiceUrl={tripData.invoiceUrl} />
                )}

                {tripData.status.toLowerCase() === 'completed' && tripRating.length === 0 && <TripReviewDialogTrigger tripData={tripData} />}
            </div>
        </div>
    );
}
