'use client';

import { GoogleAuthProvider, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';
import useLoginModal from '@/hooks/useLoginModal';
import useRegisterModal from '@/hooks/useRegisterModal';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { useCallback, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoWarning } from 'react-icons/io5';
import { LuLoader2 } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import { login, logout } from '@/lib/auth';
import { createNewUser } from '@/server/createNewUser';
import { getBundeeToken, getUserByEmail, getUserByPhoneNumber } from '@/server/userOperations';
import Link from 'next/link';
import ClientOnly from '../ClientOnly';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import Logo from '@/components/landing_page/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import usePhoneNumberSignInModal from '@/hooks/usePhoneNumberSignModal';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import usePhoneNumberVerificationModal from '@/hooks/usePhoneNumberVerificationModal';
import { linkWithCredential, PhoneAuthProvider, RecaptchaVerifier, updatePhoneNumber } from 'firebase/auth';
import { Label } from '../ui/label';
import { PhoneInput } from '../ui/phone-input';
import { getSession } from '@/lib/auth';
import { toast } from '../ui/use-toast';

const PhoneNumberSignInModal = () => {
    const router = useRouter();
    const registerModal = useRegisterModal();
    const phoneNumberSignInModal = usePhoneNumberSignInModal();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [otpError, setOTPError] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSendVerificationCode = async event => {
        event.preventDefault();
        setOTPError('');

        try {
            setLoading(true);
            const response: any = await getUserByPhoneNumber(phoneNumber);
            console.log(response);
            if (response.data.errorCode != 1) {
                phoneSignIn();
            } else {
                throw new Error('Error in get user', response.message);
            }
        } catch (error) {
            console.log(error);
            setPhoneNumber('');
            setOTPError('Account not found. Please sign up.');
        } finally {
            setLoading(false);
        }
    };

    const phoneSignIn = () => {
        const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: response => {},
            'expired-callback': () => {},
        });

        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then(confirmationResult => {
                //@ts-ignore
                window.confirmationResult = confirmationResult;
                setLoading(false);
                setVerificationId('show OTP');
            })
            .catch(error => {
                console.log(error.code);
                handleAuthError(error.code);
                setLoading(false);
            });
    };

    function onOTPVerify() {
        setLoading(true);
        //@ts-ignore
        window.confirmationResult
            .confirm(verificationCode)
            .then(async res => {
                const response: any = await getUserByEmail(phoneNumber);
                if (response.success) {
                    const payload: any = {
                        userData: response.data.userResponse,
                    };
                    closeModal();
                    await login(payload);
                    router.refresh();
                } else {
                    throw new Error(response.message);
                }
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
                toast({
                    variant: 'destructive',
                    description: 'Wrong OTP!',
                });
                setVerificationCode('');
            });
    }

    function openModal() {
        setPhoneNumber('');
        setOTPError('');
        setVerificationCode('');
        setVerificationId('');
        setVerificationSent(false);
        phoneNumberSignInModal.onOpen();
    }
    function closeModal() {
        setPhoneNumber('');
        setOTPError('');
        setVerificationCode('');
        setVerificationId('');
        setVerificationSent(false);
        phoneNumberSignInModal.onClose();
    }

    const handleAuthError = error => {
        const errorMap = {
            'auth/user-not-found': 'User account not found.',
            'auth/wrong-password': 'Incorrect password. Try again.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many requests. Please try again later.',
            'auth/user-disabled': 'Account has been disabled.',
            'auth/missing-password': 'Please enter your password.',
            'auth/invalid-credential': 'Invailid Credentials. Please try again.',
            'auth/argument-error': 'Invalid argument. Please check your input and try again.',
            'auth/invalid-phone-number': 'Invalid phone number. Please enter a valid phone number.',
            default: 'An error occurred. Please try again.',
        };
        setPhoneNumber('');
        setOTPError(errorMap[error] || errorMap.default);
        console.log(otpError);
    };

    return (
        <Modal isOpen={phoneNumberSignInModal.isOpen} onClose={closeModal} className='lg:max-w-lg'>
            <ModalHeader onClose={closeModal}>{''}</ModalHeader>
            <ModalBody className={`  transition-all delay-1000 ${!phoneNumberSignInModal.isOpen ? ' rotate-90' : ' rotate-0'}`}>
                <ClientOnly>
                    <main className='flex items-center justify-center p-2 md:p-6 '>
                        <div className='w-full'>
                            <div className='flex flex-col items-center gap-4'>
                                <Logo className='scale-[1.3]' />

                                <span className='mb-4 ml-4 text-xl font-semibold text-neutral-700 '>Login with Bundee account</span>
                            </div>

                            {!verificationId ? (
                                <div className='space-y-6'>
                                    <Label htmlFor='phoneNumber' className='mt-6'>
                                        Phone Number:
                                    </Label>
                                    <PhoneInput
                                        value={phoneNumber}
                                        onChange={setPhoneNumber}
                                        defaultCountry='US'
                                        international
                                        placeholder='Enter a phone number'
                                    />
                                    <Button
                                        type='button'
                                        className='ml-auto w-full'
                                        onClick={handleSendVerificationCode}
                                        disabled={!phoneNumber || verificationSent || loading}>
                                        {loading ? <LuLoader2 className='h-5 w-5 animate-spin text-white' /> : <>Send Verification Code</>}
                                    </Button>
                                </div>
                            ) : (
                                <div className='flex flex-col gap-4'>
                                    <Label htmlFor='verificationCode'>Verification Code:</Label>

                                    <InputOTP
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={value => setVerificationCode(value)}
                                        className='flex w-fit justify-center overflow-x-hidden lg:max-w-[200px] '>
                                        <InputOTPGroup className='flex justify-center   md:gap-4'>
                                            <InputOTPSlot className='rounded-md border border-gray-300 ' index={0} />
                                            <InputOTPSlot className='rounded-md border border-gray-300 ' index={1} />
                                            <InputOTPSlot className='rounded-md border border-gray-300 ' index={2} />
                                            <InputOTPSlot className='rounded-md border border-gray-300 ' index={3} />
                                            <InputOTPSlot className='rounded-md border border-gray-300 ' index={4} />
                                            <InputOTPSlot className='rounded-md border border-gray-300 ' index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>

                                    <Button type='button' disabled={verificationCode.length != 6} onClick={onOTPVerify}>
                                        Verify Code
                                    </Button>
                                </div>
                            )}
                            {otpError && <p className='mt-3 rounded-md bg-red-100 p-2 text-red-500'>{otpError}</p>}
                            <div id='recaptcha-container'></div>

                            <hr className='my-4' />

                            <div className='mt-4 flex flex-col gap-2'>
                                <p className='mt-1 text-base'>
                                    Don't have an account?
                                    <span
                                        onClick={() => {
                                            phoneNumberSignInModal.onClose();
                                            registerModal.onOpen();
                                        }}
                                        className='mx-1 cursor-pointer text-base font-medium text-primary  hover:underline'>
                                        Sign up
                                    </span>
                                    here
                                </p>
                            </div>
                        </div>
                    </main>
                </ClientOnly>
            </ModalBody>
        </Modal>
    );
};

export default PhoneNumberSignInModal;
