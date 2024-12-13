'use client';

import BackButton from '@/components/custom/BackButton';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { useTripDetails } from '@/hooks/useTripDetails';
import type { TripData } from '@/types';
import { useQueryState } from 'next-usequerystate';
import { useMediaQuery } from 'react-responsive';
import CancelTripComponent from '../_components/CancelTripComponent';
import EndTripComponent from '../_components/EndTripComponent';
import StartTripComponent from '../_components/StartTripComponent';
import SwapComponent from '../_components/SwapComponent';
import TripDetailsComponent from '../_components/TripDetailsComponent';
import TripModificationDialog from '../_components/TripModificationDialog';
import TripReviewDialogTrigger from '../_components/TripReviewDialogTrigger';
import MessagePage from '../message/page';

export default function page({ params }: { params: { tripId: string } }) {
    const { tripId } = params;
    const { data: response, isLoading, error, isFetching } = useTripDetails(tripId);

    const [showMessage, setShowMessage] = useQueryState('messages', { defaultValue: 'false', history: 'replace' });
    const isMessageVisible = showMessage === 'true';

    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 1023px)' });

    // Early return if tripId is missing
    if (!tripId) return <ErrorComponent message='Trip ID is required.' />;

    if (isLoading)
        return (
            <div className='min-h-[100dvh] py-4'>
                <TripsDetailsSkeleton />
            </div>
        );

    if (error || !response?.success) return <ErrorComponent message={error?.message || response.message} />;

    // Memoized data for optimization
    const tripData: TripData = response?.data?.activetripresponse[0];
    const paymentSchedule = response?.data?.paymentLogs || [];
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

            {status === 'started' && <EndTripComponent tripId={Number(tripId)} />}

            {tripData.isRentalAgreed && tripData.isLicenseVerified && tripData.isPhoneVarified && status === 'approved' && (
                <StartTripComponent starttime={tripData.starttime} tripid={tripData.tripid} zipCode={tripData.vehzipcode} />
            )}

            {['approved', 'started', 'requested'].includes(status) && <TripModificationDialog tripData={tripData} />}

            {!['started', 'cancelled', 'completed', 'rejected', 'cancellation requested'].includes(status) && <CancelTripComponent tripId={tripData.tripid} />}
        </>
    );

    return (
        <div className='container flex-grow'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-x-10'>
                {/* Header Section */}
                <div className='col-span-1 flex items-center justify-between pt-4 lg:col-span-5 lg:pt-0'>
                    <BackButton />
                    <Button
                        variant='outline'
                        className='border-primary text-primary lg:hidden'
                        size='sm'
                        onClick={() => setShowMessage(isMessageVisible ? 'false' : 'true')}
                        aria-label='Toggle messages'>
                        {isMessageVisible ? 'Details' : 'Messages'}
                    </Button>
                    <div className='ml-auto hidden items-center justify-between gap-10 lg:flex'>{renderActionButtons()}</div>
                </div>

                {/* Main Content Area */}
                <div className='col-span-1 flex flex-col gap-6 lg:col-span-5 lg:flex-row lg:gap-16'>
                    {/* Trip Details Section */}
                    <div className={`overflow-y-auto lg:w-3/5 ${isMessageVisible && !isTabletOrLarger ? 'hidden' : 'block'}`}>
                        <TripDetailsComponent
                            tripData={tripData}
                            driverUploadedImages={tripData.driverTripStartingBlobs}
                            hostUploadedImages={tripData.hostTripStartingBlobs}
                            hostName={`${tripData.hostFirstName} ${tripData.hostLastName}`.trim()}
                            hostPhoneNumber={tripData.hostPhoneNumber || ''}
                            hostImage={tripData.hostImage || ''}
                            isFetching={isFetching}
                            swapStatus={swapRequestDetails?.statuscode}
                            paymentSchedule={paymentSchedule}
                        />
                    </div>

                    {/* Messages Section */}
                    <div className={`h-full lg:w-2/5 ${!isMessageVisible && !isTabletOrLarger ? 'hidden' : 'block'}`}>
                        <div className='sticky top-20 bg-background '>
                            <MessagePage params={params} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Mobile Actions */}
            <div
                className={`fixed right-0 bottom-0 left-0 z-10 flex flex-wrap justify-around gap-3 bg-background px-4 py-2 shadow-[0px_0px_9px_0px_#00000024] lg:hidden ${isMessageVisible ? 'hidden' : 'block'}`}>
                {renderActionButtons()}
            </div>
        </div>
    );
}
