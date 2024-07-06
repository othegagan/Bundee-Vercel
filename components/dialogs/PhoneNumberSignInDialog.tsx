'use client';

import Logo from '@/components/landing_page/Logo';
import usePhoneNumberSignInDialog from '@/hooks/dialogHooks/usePhoneNumberSignInDialog';
import useRegisterDialog from '@/hooks/dialogHooks/useRegisterDialog';
import { createSession } from '@/lib/auth';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { getUserByPhoneNumber } from '@/server/userOperations';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuLoader2 } from 'react-icons/lu';
import ClientOnly from '../ClientOnly';
import { Button } from '../ui/button';
import { Dialog, DialogBody } from '../ui/dialog';
import { OtpStyledInput } from '../ui/input-otp';
import { Label } from '../ui/label';
import PhoneNumber from '../ui/phone-number';
import { toast } from '../ui/use-toast';

export default function PhoneNumberSignInDialog() {
    const router = useRouter();
    const registerDialog = useRegisterDialog();
    const phoneNumberSignInDialog = usePhoneNumberSignInDialog();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [otpError, setOTPError] = useState('');

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (verificationCode.length === 6) {
            setTimeout(() => {
                onOTPVerify();
            }, 200);
        }
    }, [verificationCode]);

    const handleSendVerificationCode = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        setOTPError('');

        if (!phoneNumber) {
            setOTPError('Phone Number is required');
            return;
        }

        if (phoneNumber.replace(/\ /g, '').length < 11) {
            setOTPError('Invalid phone number, must be 10 digits');
            return;
        }

        setLoading(true);
        try {
            const response = await getUserByPhoneNumber(`+${phoneNumber}`);
            if (response.success) {
                initiatePhoneSignIn();
            } else {
                throw new Error('Account not found. Please sign up.');
            }
        } catch (error) {
            console.error(error);
            setOTPError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const initiatePhoneSignIn = () => {
        const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container');
        signInWithPhoneNumber(auth, `+${phoneNumber}`, appVerifier)
            .then((confirmationResult: any) => {
                // @ts-ignore
                window.confirmationResult = confirmationResult;
                setVerificationId('show OTP');
            })
            .catch((error: { code: any }) => {
                handleAuthError(error.code);
                setLoading(false);
            });
    };

    const onOTPVerify = async () => {
        setVerifying(true);
        try {
            // @ts-ignore
            const confirmationResult = window.confirmationResult;
            const res = await confirmationResult.confirm(verificationCode);
            const response = await getUserByPhoneNumber(`+${phoneNumber}`);
            if (response.success) {
                await createSession({ userData: response.data.userResponse });
                closeModal();
                // router.refresh();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', description: 'Wrong OTP!' });
            setVerificationCode('');
        } finally {
            setVerifying(false);
        }
    };

    const openModal = () => {
        resetState();
        phoneNumberSignInDialog.onOpen();
    };

    const closeModal = () => {
        resetState();
        phoneNumberSignInDialog.onClose();
    };

    const resetState = () => {
        setPhoneNumber('');
        setOTPError('');
        setVerificationCode('');
        setVerificationId('');
    };

    const handleAuthError = (error: string) => {
        const errorMap = getFirebaseErrorMessage(error);
        setOTPError(errorMap);
        console.error(otpError);
    };

    return (
        <Dialog isOpen={phoneNumberSignInDialog.isOpen} closeDialog={closeModal} className='lg:max-w-lg'>
            <DialogBody>
                <ClientOnly>
                    <main className='flex items-center justify-center p-2 md:p-6'>
                        <div className='w-full'>
                            <div className='flex flex-col items-center gap-4'>
                                <Logo className='scale-[1.3]' />
                                <span className='mb-4 ml-4 text-xl font-semibold text-neutral-700'>Login with MyBundee account</span>
                            </div>

                            {!verificationId ? (
                                <div className='space-y-6'>
                                    <Label htmlFor='phoneNumber' className='mt-6'>
                                        Phone Number:
                                    </Label>
                                    <PhoneNumber setPhone={setPhoneNumber} phone={phoneNumber} />
                                    <Button type='button' className='ml-auto w-full' onClick={handleSendVerificationCode} disabled={!phoneNumber || loading}>
                                        {loading ? <LuLoader2 className='h-5 w-5 animate-spin text-white' /> : 'Send Verification Code'}
                                    </Button>
                                </div>
                            ) : (
                                <div className='flex flex-col gap-4'>
                                    <Label htmlFor='verificationCode'>Verification Code:</Label>
                                    <OtpStyledInput
                                        numInputs={6}
                                        inputType='number'
                                        value={verificationCode}
                                        onChange={setVerificationCode}
                                        className='flex w-fit justify-center overflow-x-hidden lg:max-w-[200px]'
                                    />
                                    <Button type='button' disabled={verificationCode.length !== 6 || verifying} onClick={onOTPVerify}>
                                        {verifying ? <LuLoader2 className='h-5 w-5 animate-spin text-white' /> : 'Verify Code'}
                                    </Button>
                                </div>
                            )}
                            {otpError && <p className='mt-3 rounded-md bg-red-100 p-2 text-red-500'>{otpError}</p>}
                            <div id='recaptcha-container' className={`${!verificationId ? '' : 'hidden'}`} />
                            <hr className='my-4' />
                            <div className='mt-4 flex flex-col gap-2'>
                                <p className='mt-1 text-base'>
                                    Don't have an account?
                                    <button
                                        type='button'
                                        onClick={() => {
                                            phoneNumberSignInDialog.onClose();
                                            registerDialog.onOpen();
                                        }}
                                        className='mx-1 cursor-pointer text-base font-medium text-primary hover:underline'>
                                        Sign up
                                    </button>
                                    here
                                </p>
                            </div>
                        </div>
                    </main>
                </ClientOnly>
            </DialogBody>
        </Dialog>
    );
}
