'use client';

import BackButton from '@/components/custom/BackButton';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { useTripDetails } from '@/hooks/useTripDetails';
import Link from 'next/link';
import CancelTripComponent from '../_components/CancelTripComponent';
import EndTripComponent from '../_components/EndTripComponent';
import StartTripComponent from '../_components/StartTripComponent';
import SwapComponent from '../_components/SwapComponent';
import TripDetailsComponent from '../_components/TripDetailsComponent';
import TripModificationDialog from '../_components/TripModificationDialog';
import TripReviewDialogTrigger from '../_components/TripReviewDialogTrigger';
import MessagePage from '../message/page';

interface TripData {
    tripid: string;
    status: string;
    starttime: string;
    endtime: string;
    vehzipcode: string;
    isRentalAgreed: boolean;
    isLicenseVerified: boolean;
    isPhoneVarified: boolean;
    swapDetails: any[];
    driverTripStartingBlobs: string[];
    hostTripStartingBlobs: string[];
    hostFirstName: string;
    hostLastName: string;
    hostPhoneNumber: string;
    hostImage: string;
    [key: string]: any;
}

interface PageProps {
    params: { tripId: string };
}

export default function page({ params }: { params: { tripId: string } }) {
    const { tripId } = params;
    const { data: response, isLoading, error, isFetching } = useTripDetails(tripId);

    // Early return if tripId is missing
    if (!tripId) return <ErrorComponent message='Trip ID is required.' />;
    if (isLoading) return <TripsDetailsSkeleton />;
    if (error || !response?.success) return <ErrorComponent />;

    // Memoized data for optimization
    const tripData: TripData = response?.data?.activetripresponse[0];
    const tripRating = response?.data?.tripreview || [];
    const swapRequestDetails = tripData?.swapDetails[0];
    const status = tripData?.status?.toLowerCase() || '';

    // Function to render action buttons
    const renderActionButtons = () => (
        <>
            {swapRequestDetails && (
                <SwapComponent
                    swapRequestDetails={swapRequestDetails}
                    originalStartDate={new Date(tripData.starttime)}
                    originalEndDate={new Date(tripData.endtime)}
                    zipCode={tripData.vehzipcode}
                />
            )}

            {status === 'completed' && tripRating.length === 0 && <TripReviewDialogTrigger tripData={tripData} />}

            {!['started', 'cancelled', 'completed', 'rejected', 'cancellation requested'].includes(status) && <CancelTripComponent tripId={tripData.tripid} />}

            {status === 'started' && <EndTripComponent tripId={Number(tripId)} />}

            {tripData.isRentalAgreed && tripData.isLicenseVerified && tripData.isPhoneVarified && status === 'approved' && (
                <StartTripComponent starttime={tripData.starttime} tripid={tripData.tripid} zipCode={tripData.vehzipcode} />
            )}

            {['approved', 'started', 'requested'].includes(status) && <TripModificationDialog tripData={tripData} />}
        </>
    );

    return (
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 px-4 pb-20 lg:gap-y-6 lg:gap-x-10'>
            {/* Header Section */}
            <div className='flex items-center justify-between col-span-1 lg:col-span-5'>
                <BackButton />
                <Link href={`/trips/${tripId}/message`} role='tab' className='block lg:hidden' aria-label='Messages'>
                    <Button variant='outline' className='text-primary border-primary' size='sm'>
                        Messages
                    </Button>
                </Link>
                <div className='ml-auto gap-10 items-center justify-between hidden lg:flex'>{renderActionButtons()}</div>
            </div>

            {/* Trip Details Section */}
            <div className='flex flex-col col-span-1 lg:col-span-3'>
                <TripDetailsComponent
                    tripData={tripData}
                    driverUploadedImages={tripData.driverTripStartingBlobs}
                    hostUploadedImages={tripData.hostTripStartingBlobs}
                    hostName={`${tripData.hostFirstName} ${tripData.hostLastName}`.trim()}
                    hostPhoneNumber={tripData.hostPhoneNumber || ''}
                    hostImage={tripData.hostImage || ''}
                    isFetching={isFetching}
                />
            </div>

            {/* Messages Section for Desktop */}
            <div className='hidden lg:flex flex-col col-span-2'>
                <MessagePage params={params} />
            </div>

            {/* Bottom Mobile Actions */}
            <div className='lg:hidden fixed bottom-0 left-0 right-0 flex justify-around flex-wrap gap-3 z-10 bg-background px-4 py-2 shadow-[0px_0px_9px_0px_#00000024]'>
                {renderActionButtons()}
            </div>
        </div>
    );
}
