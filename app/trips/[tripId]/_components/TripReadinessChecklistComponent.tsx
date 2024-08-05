'use client';

import { RxQuestionMarkCircled } from 'react-icons/rx';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import DocumentHandlerComponent from './DocumentHandlerComponent';
import { useDriverReadiness } from '@/hooks/useDriverReadiness';
import usePhoneNumberVerificationDialog from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import usePersona from '@/hooks/usePersona';
import { Skeleton } from '@/components/ui/skeleton';

export default function TripReadinessChecklistComponent({ trip }: any) {
    const { data: response, isLoading, error } = useDriverReadiness();
    const phoneNumberDialog = usePhoneNumberVerificationDialog();
    const { createClient } = usePersona();

    const drivingLicenseFlag = response?.data?.driverProfiles.some((profile) => !!profile.personaEnquiryId);
    const isPhoneVerifiedFlag = response?.data?.userResponse?.isPhoneVarified;

    return (
        <div className='flex flex-col gap-2'>
            <div className='text-md font-bold '>Readiness Checklist</div>

            {isLoading ? (
                <div className='space-y-2'>
                    <Skeleton className='h-8 w-full rounded-lg bg-neutral-200' />
                    <Skeleton className='h-8 w-full rounded-lg bg-neutral-200' />
                    <Skeleton className='h-8 w-full rounded-lg bg-neutral-200' />
                </div>
            ) : null}

            {error ? <div className='text-red-500'>Error: {error.message}</div> : null}

            {!isLoading && !error && (
                <>
                    {/* Driving Licence */}
                    <div className='flex items-center justify-between'>
                        <div className='text-md w-fit flex-center gap-2'>
                            {!drivingLicenseFlag ? (
                                <RxQuestionMarkCircled className='text-yellow-500 size-5' />
                            ) : (
                                <IoCheckmarkCircleOutline className='text-green-500 size-5' />
                            )}{' '}
                            Driving Licence
                        </div>
                        {!drivingLicenseFlag ? (
                            <button type='button' className='text-md underline underline-offset-2' onClick={() => createClient(() => {})}>
                                Upload
                            </button>
                        ) : (
                            <button type='button' className='text-md underline underline-offset-2' onClick={() => createClient(() => {})}>
                                Change
                            </button>
                        )}
                    </div>

                    {/* Rental Agreement */}
                    <div className='flex items-center justify-between'>
                        <div className='text-md w-fit flex-center gap-2'>
                            {!trip.isRentalAgreed ? (
                                <RxQuestionMarkCircled className='text-yellow-500 size-5' />
                            ) : (
                                <IoCheckmarkCircleOutline className='text-green-500 size-5' />
                            )}{' '}
                            Rental Agreement
                        </div>
                        {!trip.isRentalAgreed && ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(trip.status.toLowerCase()) === -1 && (
                            <DocumentHandlerComponent
                                isRentalAgreed={trip.isRentalAgreed}
                                tripId={trip.tripid}
                                rentalAgrrementUrl={trip.rentalAgrrementUrl}
                                rentalAgreedDate={trip.rentalAgreedDate}
                            />
                        )}
                        {trip.isRentalAgreed && (
                            <DocumentHandlerComponent
                                isRentalAgreed={trip.isRentalAgreed}
                                tripId={trip.tripid}
                                rentalAgrrementUrl={trip.rentalAgrrementUrl}
                                rentalAgreedDate={trip.rentalAgreedDate}
                            />
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className='flex items-center justify-between'>
                        <div className='text-md w-fit flex-center gap-2'>
                            {!isPhoneVerifiedFlag ? (
                                <RxQuestionMarkCircled className='text-yellow-500 size-5' />
                            ) : (
                                <IoCheckmarkCircleOutline className='text-green-500 size-5' />
                            )}{' '}
                            Phone Number
                        </div>
                        {!isPhoneVerifiedFlag ? (
                            <button
                                type='button'
                                className='text-md underline underline-offset-2'
                                onClick={() => {
                                    phoneNumberDialog.onOpen();
                                }}>
                                Verify
                            </button>
                        ) : (
                            <button
                                type='button'
                                className='text-md underline underline-offset-2'
                                onClick={() => {
                                    phoneNumberDialog.onOpen();
                                }}>
                                Change
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
