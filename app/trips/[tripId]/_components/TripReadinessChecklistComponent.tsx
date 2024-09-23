'use client';

import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import usePhoneNumberVerificationDialog from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import { RentalAgreementHandler } from './DocumentHandlerComponent';

export default function TripReadinessChecklistComponent({ trip }: any) {
    const phoneNumberDialog = usePhoneNumberVerificationDialog();
    const drivingLicenseDialog = useDrivingLicenceDialog();

    const drivingLicenseFlag = trip.isLicenseVerified;
    const isPhoneVerifiedFlag = trip.isPhoneVarified;
    const insuranceFlag = false;

    return (
        <div className='flex flex-col gap-2'>
            <div className='font-bold text-md '>Readiness Checklist</div>

            {/* Driving Licence */}
            <div className='flex items-center justify-between'>
                <div className='w-fit flex-center gap-2 text-md'>
                    {!drivingLicenseFlag ? (
                        <RxQuestionMarkCircled className='size-5 text-yellow-500' />
                    ) : (
                        <IoCheckmarkCircleOutline className='size-5 text-green-500' />
                    )}{' '}
                    Driving Licence
                </div>
                {!drivingLicenseFlag ? (
                    <button
                        type='button'
                        className='text-md underline underline-offset-2'
                        onClick={() => {
                            drivingLicenseDialog.isUpdate = false;
                            drivingLicenseDialog.onOpen();
                        }}>
                        Upload
                    </button>
                ) : (
                    <button
                        type='button'
                        className='text-md underline underline-offset-2'
                        onClick={() => {
                            drivingLicenseDialog.isUpdate = true;
                            drivingLicenseDialog.onOpen();
                        }}>
                        Update
                    </button>
                )}
            </div>

            {/* Insurance */}
            <div className='flex items-center justify-between'>
                <div className='w-fit flex-center gap-2 text-md'>
                    {!insuranceFlag ? (
                        <RxQuestionMarkCircled className='size-5 text-yellow-500' />
                    ) : (
                        <IoCheckmarkCircleOutline className='size-5 text-green-500' />
                    )}{' '}
                    Insurance
                </div>
                <button type='button' className='text-md underline underline-offset-2'>
                    Coming Soon
                </button>
            </div>

            {/* Rental Agreement */}
            <div className='flex items-center justify-between'>
                <div className='w-fit flex-center gap-2 text-md'>
                    {!trip.isRentalAgreed ? (
                        <RxQuestionMarkCircled className='size-5 text-yellow-500' />
                    ) : (
                        <IoCheckmarkCircleOutline className='size-5 text-green-500' />
                    )}{' '}
                    Rental Agreement
                </div>
                {!trip.isRentalAgreed && ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(trip.status.toLowerCase()) === -1 && (
                    <RentalAgreementHandler
                        isRentalAgreed={trip.isRentalAgreed}
                        tripId={trip.tripid}
                        rentalAgrrementUrl={trip.rentalAgrrementUrl}
                        rentalAgreedDate={trip.rentalAgreedDate}
                    />
                )}
                {trip.isRentalAgreed && (
                    <RentalAgreementHandler
                        isRentalAgreed={trip.isRentalAgreed}
                        tripId={trip.tripid}
                        rentalAgrrementUrl={trip.rentalAgrrementUrl}
                        rentalAgreedDate={trip.rentalAgreedDate}
                    />
                )}
            </div>

            {/* Phone Number */}
            <div className='flex items-center justify-between'>
                <div className='w-fit flex-center gap-2 text-md'>
                    {!isPhoneVerifiedFlag ? (
                        <RxQuestionMarkCircled className='size-5 text-yellow-500' />
                    ) : (
                        <IoCheckmarkCircleOutline className='size-5 text-green-500' />
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
        </div>
    );
}
