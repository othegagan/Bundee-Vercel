'use client';

import PhoneNumberModal from '@/components/modals/PhoneNumberVerification';
import LoginModal from '../components/modals/LoginModal';
import RegisterModal from '../components/modals/RegisterModal';

const ModalsProvider = () => {
    return (
        <>
            <LoginModal />
            <RegisterModal />
            <PhoneNumberModal />
        </>
    );
};

export default ModalsProvider;
