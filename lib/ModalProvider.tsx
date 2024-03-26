'use client';

import PhoneNumberModal from '@/components/modals/PhoneNumberVerification';
import LoginModal from '../components/modals/LoginModal';
import RegisterModal from '../components/modals/RegisterModal';
import PhoneNumberSignInModal from '@/components/modals/PhoneNumberSignInModal';
import ClientOnly from '@/components/ClientOnly';
import TripReviewModal from '@/components/modals/TripReviewModal';

const ModalsProvider = () => {
    return (
        <ClientOnly>
            <LoginModal />
            <RegisterModal />
            <PhoneNumberModal />
            <PhoneNumberSignInModal />
            <TripReviewModal/>
        </ClientOnly>
    );
};

export default ModalsProvider;
