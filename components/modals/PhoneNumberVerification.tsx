'use client';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import usePhoneNumberVerificationModal from '@/hooks/usePhoneNumberVerificationModal';
import { auth } from '@/lib/firebase';
import { linkWithCredential, PhoneAuthProvider, RecaptchaVerifier, updatePhoneNumber } from 'firebase/auth';
import { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { PhoneInput } from '../ui/phone-input';
import { getSession } from '@/lib/auth';
import { getUserByEmail, updateProfile } from '@/server/userOperations';

const PhoneNumberModal = () => {
    const phoneNumberVerificationModal = usePhoneNumberVerificationModal();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [otpError, setOTPError] = useState('');

    const handleSendVerificationCode = async () => {
        try {
            const formattedPhoneNumber = phoneNumber;
            const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container');

            let phoneAuthProvider = new PhoneAuthProvider(auth);
            const verifyId = await phoneAuthProvider.verifyPhoneNumber(formattedPhoneNumber, appVerifier);

            setVerificationId(verifyId);
            setVerificationSent(true); // Set flag to indicate verification code has been sent
        } catch (error) {
            console.error('Error sending code:', error.code);
            // Handle errors appropriately
            handleAuthError(error.code);
        }
    };

    const handleVerifyCode = async () => {
        try {
            setOTPError('');
            if (!verificationId) {
                console.error('No verification ID available. Please request a verification code first.');
                return;
            }
            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            console.log('credential', credential);

            // const update = await updatePhoneNumber(auth.currentUser, credential);
            // console.log(update);

            const result = await linkWithCredential(auth.currentUser, credential);
            console.log(result);
            if (result) {
                // Clear state variables and handle success

                const session = await getSession();

                const userResponse = await getUserByEmail(session.email);

                const updatePayload = { ...userResponse.data.userResponse, mobilePhone: phoneNumber };
                const response = await updateProfile(updatePayload);
                setPhoneNumber('');
                setVerificationId('');
                setVerificationSent(false);
                window.location.reload();
            }
        } catch (error: any) {
            handleAuthError(error.code);
            console.error('Error verifying code:', error.code);
            // Handle errors appropriately
        }
    };

    const handleAuthError = error => {
        const errorMap = {
            'auth/user-not-found': 'User account not found.',
            'auth/wrong-password': 'Incorrect password. Try again.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many requests. Please try again later.',
            'auth/user-disabled': 'Account has been disabled.',
            'auth/missing-password': 'Please enter your password.',
            'auth/invalid-credential': 'Invailid Credentials. Please try again.',
            'auth/invalid-phone-number': 'Invalid phone number. Please enter a valid phone number.',
            'auth/auth/code-expired': 'Invalid OTP. Please enter a valid OTP.',
            'auth/provider-already-linked': 'Account already linked with phone number',
            default: 'An error occurred. Please try again.',
        };
        setPhoneNumber('');
        setOTPError(errorMap[error] || errorMap.default);
        console.log(otpError);
    };

    function openModal() {
        setPhoneNumber('');
        setOTPError('');
        setVerificationCode('');
        setVerificationId('');
        setVerificationSent(false);
        phoneNumberVerificationModal.onOpen();
    }
    function closeModal() {
        setPhoneNumber('');
        setOTPError('');
        setVerificationCode('');
        setVerificationId('');
        setVerificationSent(false);
        phoneNumberVerificationModal.onClose();
    }

    return (
        <Modal isOpen={phoneNumberVerificationModal.isOpen} onClose={closeModal} className='lg:max-w-lg'>
            <ModalHeader onClose={closeModal}>{''}</ModalHeader>
            <ModalBody className=''>
                <div className='flex flex-col space-y-4'>
                    <h4>Update Phone Number</h4>
                    {!verificationId ? (
                        <>
                            <Label htmlFor='phoneNumber' className='mt-6'>
                                New Phone Number:
                            </Label>
                            <PhoneInput value={phoneNumber} onChange={setPhoneNumber} defaultCountry='US' international placeholder='Enter a phone number' />
                            <Button type='button' className='ml-auto w-fit' onClick={handleSendVerificationCode} disabled={!phoneNumber || verificationSent}>
                                {verificationSent ? 'Resend Verification Code' : 'Send Verification Code'}
                            </Button>
                        </>
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

                            <Button type='button' className='w-fit' disabled={verificationCode.length != 6} onClick={handleVerifyCode}>
                                Verify Code
                            </Button>
                        </div>
                    )}
                    {otpError && <p className='rounded-md bg-red-100 p-2 text-red-500'>{otpError}</p>}

                    {!otpError && !verificationId && <div id='recaptcha-container'></div>}
                </div>
            </ModalBody>
        </Modal>
    );
};

export default PhoneNumberModal;
