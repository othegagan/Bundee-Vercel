'use client';

import BackButton from '@/components/custom/BackButton';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsDetailsSkeleton, VehiclesDetailsSkeleton, shimmer } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTripDetails } from '@/hooks/useTripDetails';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import Link from 'next/link';
import { StatusBadge } from '../../TripsComponent';
import CancelTripComponent from '../_components/CancelTripComponent';
import DocumentHandlerComponent from '../_components/DocumentHandlerComponent';
import StartTripComponent from '../_components/StartTripComponent';
import SwapComponent from '../_components/SwapComponent';
import TripDetailsComponent from '../_components/TripDetailsComponent';
import TripImageVideoUploadComponent from '../_components/TripImageVideoUploadComponent';
import TripModificationDialog from '../_components/TripModificationDialog';
import TripPriceListComponent from '../_components/TripPaymentComponent';
import TripPoliciesComponent from '../_components/TripPoliciesComponent';
import TripReviewDialogTrigger from '../_components/TripReviewDialogTrigger';
import MessagePage from '../message/page';

export default function page({ params }: { params: { tripId: string } }) {
    if (!params.tripId) {
        return <ErrorComponent message='Trip ID is required.' />;
    }

    const { data: response, isLoading, error, isFetching } = useTripDetails(params.tripId);

    if (isLoading) {
        return <TripsDetailsSkeleton />;
    }

    if (error || !response?.success) {
        return <ErrorComponent />;
    }

    const tripData = response?.data?.activetripresponse[0];
    const tripRating = response?.data?.tripreview;
    const swapRequestDetails = tripData?.swapDetails[0];

    return (
        <div className=' grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 pb-20 lg:gap-y-6 lg:gap-x-10'>
            <div className='flex items-center justify-between col-span-1 lg:col-span-3'>
                <BackButton />
                <Link href={`/trips/${params.tripId}/message`} role='tab' className='block lg:hidden'>
                    <Button variant='outline' className='text-primary border-primary' size='sm'>
                        Messages
                    </Button>
                </Link>

                <div className='ml-auto  items-center justify-between hidden lg:flex'>
                    {swapRequestDetails && (
                        <SwapComponent
                            swapRequestDetails={swapRequestDetails}
                            originalStartDate={new Date(tripData.starttime)}
                            originalEndDate={new Date(tripData.endtime)}
                        />
                    )}

                    {tripData.status.toLowerCase() === 'completed' && tripRating.length === 0 && <TripReviewDialogTrigger tripData={tripData} />}

                    {['started', 'cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripData.status.toLowerCase()) === -1 && (
                        <CancelTripComponent tripId={tripData.tripid} />
                    )}

                    {!tripData.isRentalAgreed &&
                        ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripData.status.toLowerCase()) !== -1 && (
                            <>
                                {tripData.status.toLowerCase() === 'approved' && swapRequestDetails?.statuscode.toLowerCase() !== 'swappr' && (
                                    <StartTripComponent starttime={tripData.starttime} tripid={tripData.tripid} key={tripData.tripid} />
                                )}
                            </>
                        )}

                    {['approved', 'started', 'requested'].indexOf(tripData.status.toLowerCase()) !== -1 && <TripModificationDialog tripData={tripData} />}
                </div>
            </div>

            <div className='flex flex-col col-span-1 lg:col-span-2'>
                <TripDetailsComponent
                    tripData={tripData}
                    driverUploadedImages={tripData.driverTripStartingBlobs}
                    hostUploadedImages={tripData.hostTripStartingBlobs}
                    hostName={`${tripData?.hostFirstName} ${tripData?.hostLastName}` || ''}
                    hostPhoneNumber={tripData?.hostPhoneNumber || ''}
                    hostImage={tripData?.hostImage || ''}
                    isFetching={isFetching}
                />
            </div>

            <div className='hidden lg:flex flex-col col-span-1 '>
                <MessagePage params={params} />
            </div>

            {/* Bottom Mobile Actions */}
            <div className='lg:hidden fixed bottom-0 left-0 right-0 flex justify-around  z-10 bg-background  px-4 py-2 shadow-[0px_0px_9px_0px_#00000024]'>
                {swapRequestDetails && (
                    <SwapComponent
                        swapRequestDetails={swapRequestDetails}
                        originalStartDate={new Date(tripData.starttime)}
                        originalEndDate={new Date(tripData.endtime)}
                    />
                )}

                {tripData.status.toLowerCase() === 'completed' && tripRating.length === 0 && <TripReviewDialogTrigger tripData={tripData} />}

                {['started', 'cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripData.status.toLowerCase()) === -1 && (
                    <CancelTripComponent tripId={tripData.tripid} />
                )}

                {!tripData.isRentalAgreed && ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripData.status.toLowerCase()) !== -1 && (
                    <>
                        {tripData.status.toLowerCase() === 'approved' && swapRequestDetails?.statuscode.toLowerCase() !== 'swappr' && (
                            <StartTripComponent starttime={tripData.starttime} tripid={tripData.tripid} key={tripData.tripid} />
                        )}
                    </>
                )}

                {['approved', 'started', 'requested'].indexOf(tripData.status.toLowerCase()) !== -1 && <TripModificationDialog tripData={tripData} />}
            </div>
        </div>
    );
}
