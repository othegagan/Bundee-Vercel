'use client';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import usePhoneNumberVerificationModal from '@/hooks/usePhoneNumberVerificationModal';
import { auth } from '@/lib/firebase';
import { linkWithCredential, PhoneAuthProvider, RecaptchaVerifier, updatePhoneNumber, unlink, getAuth } from 'firebase/auth';
import { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { PhoneInput } from '../ui/phone-input';
import { getSession } from '@/lib/auth';
import { getUserByEmail, updateProfile } from '@/server/userOperations';
import { toast } from '../ui/use-toast';
import { ResponsiveDialog } from '../ui/responsive-dialog';

const PhoneNumberModal = () => {
    // console.log(auth.currentUser);
    const phoneNumberVerificationModal = usePhoneNumberVerificationModal();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [otpError, setOTPError] = useState('');
    const [verifying, setVerifiying] = useState(false);

    const handleSendVerificationCode = async () => {
        try {
            setOTPError('');
            const formattedPhoneNumber = phoneNumber;
            const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container');

            let phoneAuthProvider = new PhoneAuthProvider(auth);
            const verifyId = await phoneAuthProvider.verifyPhoneNumber(formattedPhoneNumber, appVerifier);

            setVerificationId(verifyId);
            setVerificationSent(true); // Set flag to indicate verification code has been sent
            // console.log('verifyId', verifyId);
        } catch (error) {
            console.error('Error sending code:', error.code);
            console.error('Error:', error);
            // Handle errors appropriately
            handleAuthError(error.code);
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

            await updatePhoneNumber(auth.currentUser, credential);

            // const result = await linkWithCredential(auth.currentUser, credential);
            // console.log(result);

            const session = await getSession();

            const userResponse = await getUserByEmail(session.email);
            // console.log(userResponse);

            if (userResponse.success) {
                const db_data = userResponse.data.userResponse;
                const updatePayload = {
                    address_1: db_data.address_1,
                    address_2: db_data.address_2,
                    address_3: db_data.address_3,
                    city: db_data.city,
                    country: db_data.country,
                    postcode: db_data.postcode,
                    state: db_data.state,
                    driverlisense: db_data.driverlisense,
                    firstname: db_data.firstname,
                    middlename: '',
                    lastname: db_data.lastname,
                    iduser: db_data.iduser,
                    language: 'NA',
                    userimage: db_data.userimage,
                    vehicleowner: false,

                    mobilePhone: phoneNumber,
                    isPhoneVarified: true,
                    isEmailVarified: true,
                    fromValue: 'completeProfile',
                };

                const response = await updateProfile(updatePayload);
                if (response.success) {
                    setPhoneNumber('');
                    setVerificationId('');
                    setVerificationSent(false);
                    toast({
                        description: 'Phone number updated successfully',
                        duration: 3000,
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 600);
                } else {
                    throw new Error(response.message);
                }
            } else {
                throw new Error(userResponse.message);
            }
        } catch (error: any) {
            console.log(error);
            handleAuthError(error.code);
            // unLinkPhonenumber();
            console.error('Error verifying code:', error.code);
            // Handle errors appropriately
        } finally {
            setVerifiying(false);
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
            'auth/invalid-credential': 'Invalid Credentials. Please try again.',
            'auth/invalid-phone-number': 'Invalid phone number. Please enter a valid phone number.',
            'auth/auth/code-expired': 'Invalid OTP. Please enter a valid OTP.',
            'auth/invalid-verification-code': 'Invalid OTP. Please enter a valid OTP.',
            'auth/provider-already-linked': 'Account already linked with phone number',
            'auth/account-exists-with-different-credential': 'Phone number as been linked with another account. Please try again with different phone number.',
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

    // function unLinkPhonenumber() {
    //     const auth = getAuth();
    //     unlink(auth.currentUser, 'phone')
    //         .then(res => {
    //             console.log(res);
    //             // Auth provider unlinked from account
    //             // ...
    //         })
    //         .catch(error => {
    //             // An error happened
    //             // ...
    //             console.log(error);
    //         });
    // }

    return (
        <ResponsiveDialog
            isOpen={phoneNumberVerificationModal.isOpen}
            openDialog={() => {
                openModal();
            }}
            closeDialog={() => {
                closeModal();
            }}
            className='lg:max-w-lg'>
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

                        <Button type='button' className='w-fit' disabled={verificationCode.length !== 6 || verifying} onClick={handleVerifyCode}>
                            {verifying ? <div className='loader '></div> : <>Verify Code</>}
                        </Button>
                    </div>
                )}
                {otpError && <p className='rounded-md bg-red-100 p-2 text-red-500'>{otpError}</p>}

                {!otpError && !verificationId && <div id='recaptcha-container'></div>}

                {/* <Button type='button' onClick={unLinkPhonenumber} variant='outline'>
                        Unlink phone
                    </Button> */}
            </div>
        </ResponsiveDialog>
    );
};

export default PhoneNumberModal;
