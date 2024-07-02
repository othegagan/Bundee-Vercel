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
import TripModificationDialog from '../_components/TripModificationModal';
import TripPriceListComponent from '../_components/TripPriceListComponent';
import TripReviewDialogTrigger from '../_components/TripReviewDialogTrigger';
import TripVehicleDetailsComponent from '../_components/TripVehicleDetailsComponent';
import { Skeleton } from '@/components/ui/skeleton';

export default function page({ params }: { params: { bookingid: string } }) {
    const { data: response, isLoading, error, isFetching } = useTripDetails(params.bookingid);

    if (isLoading) {
        return <VehiclesDetailsSkeleton />;
    }

    if (error || !response?.success) {
        return <ErrorComponent />;
    }

    const bookingData = response?.data?.activetripresponse[0];
    const tripRating = response?.data?.tripreview;
    const swapRequestDetails = bookingData?.swapDetails[0];

    return (
        <div className='mt-3 grid grid-cols-1 gap-6 md:mt-6 md:grid-cols-2 md:gap-6 lg:grid-cols-5'>
            <div className='flex flex-col lg:col-span-3'>
                <TripVehicleDetailsComponent
                    car={bookingData.vehicleDetails[0]}
                    driverUploadedImages={bookingData.driverTripStartingBlobs}
                    hostUploadedImages={bookingData.hostTripStartingBlobs}
                    hostName={bookingData?.hostFirstName + ' ' + bookingData?.hostLastName || ""}
                    hostPhoneNumber={bookingData?.hostPhoneNumber || ""}
                    hostImage={bookingData?.hostImage || ""}
                />
            </div>

            <div className='mt-4 px-4 lg:col-span-2 lg:mt-0'>
                <TripImageVideoUploadComponent tripData={bookingData} />

                <div className='mt-10 flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                        <div className='text-md'>Booking Duration</div>
                        <div className='text-md font-medium'>
                            {bookingData.tripPaymentTokens[0]?.totaldays} {bookingData?.tripPaymentTokens[0]?.totaldays == 1 ? 'Day' : 'Days'}
                        </div>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='text-md'> Start Date</div>
                        <div className='text-md font-medium'>{formatDateAndTime(bookingData.starttime, bookingData.vehzipcode)}</div>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='text-md'> End Date</div>
                        <div className='text-md font-medium'>{formatDateAndTime(bookingData.endtime, bookingData.vehzipcode)}</div>
                    </div>

                    <div className='flex items-center justify-between'>
                        <div className='text-md'>Pickup & Return</div>
                        <div className='text-md font-medium'>
                            {bookingData?.vehaddress1 ? `${toTitleCase(bookingData?.vehaddress1)}, ` : null}
                            {bookingData?.vehaddress2 ? `${toTitleCase(bookingData?.vehaddress2)}, ` : null}
                            {bookingData?.vehcity ? `${toTitleCase(bookingData?.vehcity)}, ` : null}
                            {bookingData?.vehstate ? `${toTitleCase(bookingData?.vehstate)}, ` : null}
                            {bookingData?.vehzipcode ? `${bookingData?.vehzipcode}` : null}
                        </div>
                    </div>

                    <TripPriceListComponent pricelist={bookingData?.tripPaymentTokens[0]} />

                    <div className=' flex justify-between'>
                        <label className='text-15 font-bold'>Trip Status</label>
                        {isFetching ? (
                            <Skeleton className='h-8 w-28 rounded-lg bg-neutral-200' />
                        ) : (
                            <StatusBadge status={bookingData.status.toLowerCase()} type='booking' />
                        )}
                    </div>

                    {swapRequestDetails && (
                        <SwapComponent
                            swapRequestDetails={swapRequestDetails}
                            originalStartDate={new Date(bookingData.starttime)}
                            originalEndDate={new Date(bookingData.endtime)}
                        />
                    )}

                    {bookingData.status.toLowerCase() === 'requested' && <FreeCancellationDate tripData={bookingData} />}

                    {bookingData.isRentalAgreed && (
                        <DocumentHandlerComponent
                            isRentalAgreed={bookingData.isRentalAgreed}
                            tripId={bookingData.tripid}
                            rentalAgrrementUrl={bookingData.rentalAgrrementUrl}
                            rentalAgreedDate={bookingData.rentalAgreedDate}
                        />
                    )}
                </div>

                {!bookingData.isRentalAgreed && ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(bookingData.status.toLowerCase()) == -1 ? (
                    <DocumentHandlerComponent
                        isRentalAgreed={bookingData.isRentalAgreed}
                        tripId={bookingData.tripid}
                        rentalAgrrementUrl={bookingData.rentalAgrrementUrl}
                        rentalAgreedDate={bookingData.rentalAgreedDate}
                    />
                ) : (
                    <div className='mt-10 grid w-full grid-cols-2  gap-3'>
                        {bookingData.status.toLowerCase() === 'approved' && swapRequestDetails?.statuscode.toLowerCase() !== 'swappr' && (
                            <StartTripComponent starttime={bookingData.starttime} tripid={bookingData.tripid} key={bookingData.tripid} />
                        )}
                    </div>
                )}

                <div className='mt-6 grid w-full grid-cols-2  gap-3'>
                    {['approved', 'started', 'requested'].indexOf(bookingData.status.toLowerCase()) !== -1 && <TripModificationDialog tripData={bookingData} />}

                    {['started', 'cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(bookingData.status.toLowerCase()) === -1 && (
                        <CancelTripComponent tripId={bookingData.tripid} />
                    )}
                </div>

                {bookingData.invoiceUrl && (
                    <DocumentHandlerComponent isRentalAgreed={bookingData.isRentalAgreed} tripId={bookingData.tripid} invoiceUrl={bookingData.invoiceUrl} />
                )}

                {bookingData.status.toLowerCase() == 'completed' && tripRating.length == 0 && <TripReviewDialogTrigger tripData={bookingData} />}
            </div>
        </div>
    );
}
