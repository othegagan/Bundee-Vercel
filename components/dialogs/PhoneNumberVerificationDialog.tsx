'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogBody } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/ui/phone-input';
import { checkPhoneNumberAsLinked, usePhoneNumberVerificationDialog } from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { updateUserPhoneNumber } from '@/server/userOperations';
import { PhoneAuthProvider, RecaptchaVerifier, getAuth, linkWithCredential, unlink, updatePhoneNumber } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { OtpStyledInput } from '../ui/input-otp';

export default function PhoneNumberVerificationDialog() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { isOpen, onClose } = usePhoneNumberVerificationDialog();
    const [isSendingCode, setIsSendingCode] = useState(false);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (verificationCode.length === 6) {
            handleVerifyCode();
        }
    }, [verificationCode]);

    useEffect(() => {
        if (isOpen) {
            setupRecaptcha();
        }
        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, [isOpen]);

    const setupRecaptcha = useCallback(() => {
        if (recaptchaVerifierRef.current || !recaptchaContainerRef.current) return;

        try {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                size: 'invisible',
                callback: () => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                },
                'expired-callback': () => {
                    setError('reCAPTCHA expired. Please try again.');
                    recaptchaVerifierRef.current = null;
                }
            });
        } catch (error) {
            console.error('Error setting up reCAPTCHA:', error);
            setError('Failed to set up reCAPTCHA. Please try again.');
        }
    }, []);

    const handleSendVerificationCode = async () => {
        try {
            setError('');
            setIsSendingCode(true);

            const isPhoneLinkedResponse = await checkPhoneNumberAsLinked(phoneNumber);

            if (isPhoneLinkedResponse.success && isPhoneLinkedResponse.data.linkedToAnyUser) {
                setError('Phone number is already linked to another account');
                return;
            }

            if (!recaptchaVerifierRef.current) {
                setupRecaptcha();
            }
            if (!recaptchaVerifierRef.current) {
                throw new Error('reCAPTCHA not initialized');
            }

            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verifyId = await phoneAuthProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifierRef.current);

            setVerificationId(verifyId);
            setVerificationSent(true);
            toast.success('Verification code sent');
        } catch (error) {
            console.error(error);
            handleAuthError(error.code || error.message);
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleResendCode = async () => {
        setVerificationCode('');
        await handleSendVerificationCode();
    };

    const handleVerifyCode = async () => {
        if (!verificationId) {
            setError('Please request a verification code first.');
            return;
        }

        try {
            setIsVerifying(true);
            setError('');

            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('No user is currently signed in.');
            }

            const phoneProviderId = PhoneAuthProvider.PROVIDER_ID;
            const isPhoneLinked = currentUser.providerData.some((provider) => provider.providerId === phoneProviderId);

            if (!isPhoneLinked) {
                await linkWithCredential(currentUser, credential);
            } else {
                await updatePhoneNumber(currentUser, credential);
            }

            const response = await updateUserPhoneNumber(phoneNumber);
            if (response.success) {
                toast.success('Phone number updated successfully');
                resetModal();
                onClose();
                setTimeout(() => {
                    window.location.reload();
                }, 600);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            handleAuthError(error.code);
            // Clear the OTP input when there's an error
            setVerificationCode('');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleAuthError = (errorCode: string) => {
        const errorMessage = getFirebaseErrorMessage(errorCode);
        setError(errorMessage);
        if (errorCode === 'auth/invalid-verification-code') {
            setError('Incorrect verification code. Please try again.');
        } else if (errorCode === 'auth/invalid-app-credential') {
            setError('Invalid app credential. Please try again or contact support if the issue persists.');
        } else if (errorCode === 'auth/error-code:-39') {
            setError(`You've tried too many times in a short period of time. Please try again later.`);
        }
    };

    const resetModal = () => {
        setPhoneNumber('');
        setError('');
        setVerificationCode('');
        setVerificationId('');
        setVerificationSent(false);
        if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
        }
    };

    const closeModal = () => {
        resetModal();
        onClose();
    };

    return (
        <Dialog isOpen={isOpen} closeDialog={closeModal} className='lg:max-w-xl' title='Phone Number Verification' onInteractOutside={false}>
            <DialogBody>
                <div className='grid gap-4'>
                    {!verificationId ? (
                        <div className='flex flex-col gap-6'>
                            <p className='text-center'>Please enter your phone number to verify and secure your account.</p>
                            <div className='grid gap-2'>
                                <Label htmlFor='phone'>Phone Number</Label>
                                <PhoneInput
                                    value={phoneNumber}
                                    onRawValueChange={(rawValue) => {
                                        setPhoneNumber(rawValue);
                                    }}
                                />
                            </div>

                            {error && <p className=' text-red-500 text-sm'>{error}</p>}

                            <Button
                                type='button'
                                loading={isSendingCode}
                                onClick={handleSendVerificationCode}
                                disabled={phoneNumber.length < 12 || verificationSent || isSendingCode}>
                                {verificationSent ? 'Resend Verification Code' : 'Send Verification Code'}
                            </Button>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-4'>
                            <p className='text-left text-[15px]'>
                                We have sent a one-time code (OTP) to your phone number ending in {phoneNumber.slice(-4)}. Please enter the code to verify your
                                account.
                            </p>

                            <OtpStyledInput numInputs={6} inputType='number' value={verificationCode} onChange={(value) => setVerificationCode(value)} />

                            {error && <p className=' text-red-500 text-sm'>{error}</p>}

                            <button
                                type='button'
                                onClick={handleResendCode}
                                disabled={isSendingCode}
                                className='mx-auto my-2 flex w-fit items-end underline underline-offset-2'>
                                {isSendingCode ? 'Sending...' : 'Resend OTP'}
                            </button>

                            <Button className='w-full' onClick={handleVerifyCode} disabled={verificationCode.length !== 6 || isVerifying}>
                                {isVerifying ? 'Verifying...' : 'Verify Phone Number'}
                            </Button>
                        </div>
                    )}

                    <div ref={recaptchaContainerRef} id='recaptcha-container' />
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
