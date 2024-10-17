'use client';

import { useFirstPhoneNumberVerificationDialog } from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { createSession } from '@/lib/auth';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { getUserByEmail, updateUserPhoneNumber } from '@/server/userOperations';
import { PhoneAuthProvider, RecaptchaVerifier, getAuth, linkWithCredential, unlink, updatePhoneNumber } from 'firebase/auth';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogBody } from '../ui/dialog';
import { OtpStyledInput } from '../ui/input-otp';
import { Label } from '../ui/label';
import PhoneInput from '../ui/phone-input';

export default function PhoneNumberVerificationDialog() {
    const phoneNumberVerificationDialog = useFirstPhoneNumberVerificationDialog();
    const [phoneNumber, setPhoneNumber] = useState(phoneNumberVerificationDialog.phoneNumber || '');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [otpError, setOTPError] = useState('');
    const [verifying, setVerifiying] = useState(false);

    const handleSendVerificationCode = async () => {
        try {
            setOTPError('');

            const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container');

            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verifyId = await phoneAuthProvider.verifyPhoneNumber(phoneNumber, appVerifier);

            setVerificationId(verifyId);
            setVerificationSent(true);
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

            const response = await updateUserPhoneNumber(phoneNumber);
            if (response.success) {
                const getUserResponse = await getUserByEmail(currentUser.email);
                const authToken = phoneNumberVerificationDialog.authToken;
                if (getUserResponse.success) {
                    const userResponse = getUserResponse.data.userResponse;
                    await createSession({ userData: userResponse, authToken });
                }
                toast.success('Phone number verified successfully');
                resetModal();
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            console.log(error);
            handleAuthError(error.code);
            console.error('Error verifying code:', error.code);
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
        <Dialog
            isOpen={phoneNumberVerificationDialog.isOpen}
            closeDialog={closeModal}
            className='lg:max-w-lg'
            title='Verify Phone Number'
            onInteractOutside={false}
            showCloseButton={false}>
            <DialogBody>
                <div className='flex flex-col space-y-4'>
                    {!verificationId ? (
                        <>
                            <div className='text-sm'>Please provide your mobile number below. We'll send an OTP to verify your identity.</div>
                            <PhoneInput
                                value={phoneNumber}
                                onRawValueChange={(rawValue) => {
                                    setPhoneNumber(rawValue);
                                }}
                            />
                            <Button type='button' onClick={handleSendVerificationCode} disabled={phoneNumber.length < 12 || verificationSent}>
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
                                onChange={(value) => {
                                    setVerificationCode(value);
                                    if (verificationCode.length === 6) {
                                        setTimeout(() => {
                                            handleVerifyCode();
                                        }, 200);
                                    }
                                }}
                                className='flex w-fit justify-center'
                            />
                            <Button type='button' onClick={handleVerifyCode} disabled={verificationCode.length !== 6 || verifying} loading={verifying}>
                                Verify Code
                            </Button>
                        </div>
                    )}

                    {otpError && <p className='rounded-md bg-red-100 p-2 text-red-500'>{otpError}</p>}
                    {!otpError && !verificationId && <div id='recaptcha-container' />}
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
