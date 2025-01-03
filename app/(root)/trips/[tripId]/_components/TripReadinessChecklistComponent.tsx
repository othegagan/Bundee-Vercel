'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import { usePhoneNumberVerificationDialog } from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { useGenerateInsuranceVerificationLink } from '@/hooks/useDrivingProfile';
import { useState } from 'react';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import { toast } from 'sonner';
import { RentalAgreementHandler } from './DocumentHandlerComponent';

export default function TripReadinessChecklistComponent({ trip }: any) {
    const phoneNumberDialog = usePhoneNumberVerificationDialog();
    const drivingLicenseDialog = useDrivingLicenceDialog();

    const drivingLicenseFlag = trip.isLicenseVerified;
    const isPhoneVerifiedFlag = trip.isPhoneVarified;
    const insuranceFlag = trip.isInsuranceVerified && trip.insuranceStatus?.toLowerCase() === 'verified';
    const insuranceStatus = trip.insuranceStatus?.toLowerCase() || 'notverified';

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
                    )}
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
            {/* <div className='flex items-center justify-between'>
                <div className='w-fit flex-center gap-2 text-md'>
                    {!insuranceFlag ? (
                        <RxQuestionMarkCircled className='size-5 text-yellow-500' />
                    ) : (
                        <IoCheckmarkCircleOutline className='size-5 text-green-500' />
                    )}
                    Insurance
                </div>
                {insuranceStatus === 'inprogress' && (
                    <button type='button' className='text-md ' disabled>
                        In Progress
                    </button>
                )}

                {insuranceStatus === 'verified' && <InsuranceViewDetailsDialog />}

                {(insuranceStatus === 'notverified' || insuranceStatus === 'failed') && <InsuranceVerificationLinkGenerateButton />}
            </div> */}

            {/* Rental Agreement */}
            <div className='flex items-center justify-between'>
                <div className='w-fit flex-center gap-2 text-md'>
                    {!trip.isRentalAgreed ? (
                        <RxQuestionMarkCircled className='size-5 text-yellow-500' />
                    ) : (
                        <IoCheckmarkCircleOutline className='size-5 text-green-500' />
                    )}
                    Rental Agreement
                </div>

                {!trip.isRentalAgreed &&
                    ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(trip.status.toLowerCase()) === -1 &&
                    (!drivingLicenseFlag ? (
                        <DrivingLicencePending />
                    ) : (
                        <RentalAgreementHandler
                            isRentalAgreed={trip.isRentalAgreed}
                            tripId={trip.tripid}
                            rentalAgreementUrl={trip.rentalAgrrementUrl}
                            rentalAgreedDate={trip.rentalAgreedDate}
                        />
                    ))}

                {trip.isRentalAgreed && (
                    <RentalAgreementHandler
                        isRentalAgreed={trip.isRentalAgreed}
                        tripId={trip.tripid}
                        rentalAgreementUrl={trip.rentalAgrrementUrl}
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
                    )}
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

function InsuranceVerificationLinkGenerateButton() {
    const { refetch: generateLink, data: linkResponse, isLoading: isGeneratingLink, error: linkError } = useGenerateInsuranceVerificationLink();

    const handleReVerify = async () => {
        try {
            const result = await generateLink();
            if (result.data?.success && result.data?.data?.uri) {
                window.open(result.data.data.uri, '_blank');
            } else {
                throw new Error('Failed to generate verification link');
            }
        } catch (err) {
            toast.error('Failed to generate verification link');
        }
    };

    return (
        <button type='button' onClick={handleReVerify} disabled={isGeneratingLink} className='text-md underline underline-offset-2'>
            {isGeneratingLink ? 'Generating Link...' : 'Verify Insurance'}
        </button>
    );
}

function DrivingLicencePending() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    function openModal() {
        setIsModalOpen(true);
    }
    function closeModal() {
        setIsModalOpen(false);
    }

    return (
        <>
            <button type='button' className='text-md underline underline-offset-2' onClick={openModal}>
                Accept
            </button>

            <Dialog isOpen={isModalOpen} openDialog={openModal} closeDialog={closeModal} title='Document Verification Pending'>
                <DialogBody>
                    <p>Please complete your driver's licence verification before accepting the rental agreement.</p>
                </DialogBody>
                <DialogFooter>
                    <Button type='button' variant='black' size='sm' className='w-full sm:w-auto' onClick={closeModal}>
                        OK
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
