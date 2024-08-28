'use client';

import usePhoneNumberVerificationDialog from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { updateUserPhoneNumber } from '@/server/userOperations';
import { PhoneAuthProvider, RecaptchaVerifier, getAuth, linkWithCredential, unlink, updatePhoneNumber } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogBody } from '../ui/dialog';
import { OtpStyledInput } from '../ui/input-otp';
import { Label } from '../ui/label';
import PhoneNumber from '../ui/phone-number';

export default function PhoneNumberVerificationDialog() {
    // console.log(auth.currentUser);
    const phoneNumberVerificationDialog = usePhoneNumberVerificationDialog();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [otpError, setOTPError] = useState('');
    const [verifying, setVerifiying] = useState(false);

    useEffect(() => {
        if (verificationCode.length === 6) {
            setTimeout(() => {
                handleVerifyCode();
            }, 200);
        }
    }, [verificationCode]);

    const handleSendVerificationCode = async () => {
        try {
            setOTPError('');
            const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container');

            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verifyId = await phoneAuthProvider.verifyPhoneNumber(`+${phoneNumber}`, appVerifier);

            setVerificationId(verifyId);
            setVerificationSent(true); // Set flag to indicate verification code has been sent
            // console.log('verifyId', verifyId);
        } catch (error) {
            console.log(error);
            setOTPError(error.message);
            handleAuthError(error.code || error.message);
        }
    };

    const handleVerifyCode = async () => {
        try {
            setVerifiying(true);
            setOTPError('');

            if (!verificationId) {
                console.error('No verification ID available. Please request a verification code first.');
                return;
            }

            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            // console.log('credential', credential);

            const auth = getAuth();
            const currentUser = auth.currentUser;

            // Check if the phone provider is already linked
            const phoneProviderId = PhoneAuthProvider.PROVIDER_ID;
            const isPhoneLinked = currentUser.providerData.some((provider) => provider.providerId === phoneProviderId);

            if (!isPhoneLinked) {
                // Link the phone number to the current user
                const result = await linkWithCredential(currentUser, credential);
                console.log(result);
            } else {
                // Update the phone number directly
                await updatePhoneNumber(currentUser, credential);
            }

            const mobilePhone = `+${phoneNumber}`;
            const response = await updateUserPhoneNumber(mobilePhone);
            if (response.success) {
                setPhoneNumber('');
                setVerificationId('');
                setVerificationSent(false);
                toast.success('Phone number updated successfully');
                setTimeout(() => {
                    window.location.reload();
                }, 600);
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            console.log(error);
            handleAuthError(error.code);
            console.error('Error verifying code:', error.code);
            // Handle errors appropriately
        } finally {
            setVerifiying(false);
        }
    };

    const handleAuthError = (error: string) => {
        const errorMap = getFirebaseErrorMessage(error);
        setPhoneNumber('');
        setOTPError(errorMap);
        console.log(errorMap);
    };

    function openModal() {
        resetModal();
        phoneNumberVerificationDialog.onOpen();
    }

    function closeModal() {
        resetModal();
        phoneNumberVerificationDialog.onClose();
    }

    function resetModal() {
        setPhoneNumber('');
        setOTPError('');
        setVerificationCode('');
        setVerificationId('');
        setVerificationSent(false);
    }

    return (
        <Dialog isOpen={phoneNumberVerificationDialog.isOpen} closeDialog={closeModal} className='lg:max-w-lg' title='Update Phone Number'>
            <DialogBody className=''>
                <div className='flex flex-col space-y-4'>
                    {!verificationId ? (
                        <>
                            <Label htmlFor='phoneNumber' className='mt-6'>
                                New Phone Number:
                            </Label>
                            <PhoneNumber setPhone={setPhoneNumber} phone={phoneNumber} />
                            <Button type='button' className='ml-auto w-fit' onClick={handleSendVerificationCode} disabled={!phoneNumber || verificationSent}>
                                {verificationSent ? 'Resend Verification Code' : 'Send Verification Code'}
                            </Button>
                        </>
                    ) : (
                        <div className='flex flex-col gap-4'>
                            <Label htmlFor='verificationCode'>Verification Code:</Label>

                            <OtpStyledInput
                                numInputs={6}
                                inputType='number'
                                value={verificationCode}
                                onChange={(value) => setVerificationCode(value)}
                                className='flex w-fit justify-center overflow-x-hidden lg:max-w-[200px] '
                            />

                            <Button
                                type='button'
                                className='w-fit'
                                disabled={verificationCode.length !== 6 || verifying}
                                onClick={handleVerifyCode}
                                loading={verifying}>
                                Verify Code
                            </Button>
                        </div>
                    )}

                    {otpError && <p className='rounded-md bg-red-100 p-2 text-red-500'>{otpError}</p>}

                    {!otpError && !verificationId && <div id='recaptcha-container' />}

                    {/* <UnlinkPhoneNumberButton /> */}
                </div>
            </DialogBody>
        </Dialog>
    );
}

function UnlinkPhoneNumberButton() {
    const unLinkPhonenumber = () => {
        const auth = getAuth();
        unlink(auth.currentUser, 'phone')
            .then((res) => {
                console.log(res);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <>
            <Button type='button' onClick={unLinkPhonenumber} variant='outline'>
                Unlink phone
            </Button>
        </>
    );
}
