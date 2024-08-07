'use client';

import usePhoneNumberVerificationDialog from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import DocumentHandlerComponent from './DocumentHandlerComponent';
import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';

export default function TripReadinessChecklistComponent({ trip }: any) {
    const phoneNumberDialog = usePhoneNumberVerificationDialog();
    const drivingLicenseDialog = useDrivingLicenceDialog();

    const drivingLicenseFlag = trip.isLicenseVerified;
    const isPhoneVerifiedFlag = trip.isPhoneVarified;

    return (
        <div className='flex flex-col gap-2'>
            <div className='text-md font-bold '>Readiness Checklist</div>

            {/* Driving Licence */}
            <div className='flex items-center justify-between'>
                <div className='text-md w-fit flex-center gap-2'>
                    {!drivingLicenseFlag ? <RxQuestionMarkCircled className='text-yellow-500 size-5' /> : <IoCheckmarkCircleOutline className='text-green-500 size-5' />} Driving
                    Licence
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

            {/* Rental Agreement */}
            <div className='flex items-center justify-between'>
                <div className='text-md w-fit flex-center gap-2'>
                    {!trip.isRentalAgreed ? <RxQuestionMarkCircled className='text-yellow-500 size-5' /> : <IoCheckmarkCircleOutline className='text-green-500 size-5' />} Rental
                    Agreement
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
                    {!isPhoneVerifiedFlag ? <RxQuestionMarkCircled className='text-yellow-500 size-5' /> : <IoCheckmarkCircleOutline className='text-green-500 size-5' />} Phone
                    Number
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
