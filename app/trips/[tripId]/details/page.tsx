'use client';

import BackButton from '@/components/custom/BackButton';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { useTripDetails } from '@/hooks/useTripDetails';
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
import { TripData } from '@/types';

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
        <div className='flex-grow container'>
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-4  lg:gap-x-10'>
                {/* Header Section */}
                <div className='pt-4 lg:pt-0 flex items-center justify-between col-span-1 lg:col-span-5'>
                    <BackButton />
                    <Button
                        variant='outline'
                        className='text-primary border-primary lg:hidden'
                        size='sm'
                        onClick={() => setShowMessage(isMessageVisible ? 'false' : 'true')}
                        aria-label='Toggle messages'>
                        {isMessageVisible ? 'Details' : 'Messages'}
                    </Button>
                    <div className='ml-auto gap-10 items-center justify-between hidden lg:flex'>{renderActionButtons()}</div>
                </div>

                {/* Main Content Area */}
                <div className='col-span-1 lg:col-span-5 flex flex-col lg:flex-row gap-6 lg:gap-16'>
                    {/* Trip Details Section */}
                    <div className={`lg:w-3/5 overflow-y-auto ${isMessageVisible && !isTabletOrLarger ? 'hidden' : 'block'}`}>
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

                    {/* Messages Section */}
                    <div className={`lg:w-2/5 h-full ${!isMessageVisible && !isTabletOrLarger ? 'hidden' : 'block'}`}>
                        <div className='sticky top-20 bg-background  '>
                            <MessagePage params={params} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Mobile Actions */}
            <div
                className={`lg:hidden fixed bottom-0 left-0 right-0 flex justify-around flex-wrap gap-3 z-10 bg-background px-4 py-2 shadow-[0px_0px_9px_0px_#00000024] ${isMessageVisible ? 'hidden' : 'block'}`}>
                {renderActionButtons()}
            </div>
        </div>
    );
}
