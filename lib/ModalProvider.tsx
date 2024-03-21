'use client';

import PhoneNumberModal from '@/components/modals/PhoneNumberVerification';
import LoginModal from '../components/modals/LoginModal';
import RegisterModal from '../components/modals/RegisterModal';
import PhoneNumberSignInModal from '@/components/modals/PhoneNumberSignInModal';

const ModalsProvider = () => {
    return (
        <>
            <LoginModal />
            <RegisterModal />
            <PhoneNumberModal />
            <PhoneNumberSignInModal/>
        </>
    );
};

export default ModalsProvider;
