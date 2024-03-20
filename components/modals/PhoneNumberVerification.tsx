'use client';
import usePhoneNumberVerificationModal from '@/hooks/usePhoneNumberVerificationModal';
import { auth } from '@/lib/firebase';
import 'firebase/auth';
import { PhoneAuthProvider, updatePhoneNumber } from 'firebase/auth';
import { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const PhoneNumberModal = () => {
    const phoneNumberVerificationModal = usePhoneNumberVerificationModal();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationSent, setVerificationSent] = useState(false); // Track if verification code has been sent

    const currentUser = auth.currentUser;

    const handleSendVerificationCode = async () => {
        try {
            const formattedPhoneNumber = '+91' + phoneNumber.replace(/\D/g, ''); // Format phone number (replace with your country code)
            //@ts-ignore
            const verificationId = await PhoneAuthProvider.signInWithPhoneNumber(auth, formattedPhoneNumber);
            setVerificationId(verificationId);
            setVerificationSent(true); // Set flag to indicate verification code has been sent
        } catch (error) {
            console.error('Error sending verification code:', error);
            // Handle errors appropriately
        }
    };

    const handleVerifyCode = async code => {
        try {
            if (!verificationId) {
                console.error('No verification ID available. Please request a verification code first.');
                return;
            }
            const credential = PhoneAuthProvider.credential(verificationId, code);
            await updatePhoneNumber(currentUser, credential);
            console.log('Phone number updated successfully!');

            // Clear state variables and handle success
            setPhoneNumber('');
            setVerificationId('');
            setVerificationSent(false);
        } catch (error) {
            console.error('Error verifying code:', error);
            // Handle errors appropriately
        }
    };

    return (
        <Modal isOpen={phoneNumberVerificationModal.isOpen} onClose={phoneNumberVerificationModal.onClose} className='lg:max-w-lg'>
            <ModalHeader onClose={phoneNumberVerificationModal.onClose}>{''}</ModalHeader>
            <ModalBody>
                <div>
                    <h3>Update Phone Number</h3>
                    <Label htmlFor='phoneNumber'>New Phone Number:</Label>
                    <Input type='tel' id='phoneNumber' value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                    <Button type='button' onClick={handleSendVerificationCode} disabled={!phoneNumber || verificationSent}>
                        {verificationSent ? 'Resend Verification Code' : 'Send Verification Code'}
                    </Button>
                    {verificationId && ( // Only show verification code input if verification ID exists
                        <div>
                            <Label htmlFor='verificationCode'>Verification Code:</Label>
                            <Input type='text' id='verificationCode' onChange={e => handleVerifyCode(e.target.value)} />
                            <Button type='button' onClick={handleVerifyCode}>
                                Verify Code
                            </Button>
                        </div>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};

export default PhoneNumberModal;
