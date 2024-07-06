import ErrorComponent from '@/components/custom/ErrorComponent';
import { getSession } from '@/lib/auth';
import dynamic from 'next/dynamic';
import React from 'react';

const DrivingLicenceComponent = dynamic(() => import('./DrivingLicenceComponent'), {
    ssr: false,
});

const page = async () => {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return <ErrorComponent message='Oops, it seems you are not logged in. Please log in.' />;
    }

    return (
        <div>
            <DrivingLicenceComponent />
        </div>
    );
};

export default page;
