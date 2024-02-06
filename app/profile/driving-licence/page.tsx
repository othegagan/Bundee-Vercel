import React from 'react';
import dynamic from 'next/dynamic';

const DrivingLicenceComponent = dynamic(() => import('./DrivingLicenceComponent'), {
    ssr: false,
});

const page = () => {
    return (
        <div>
            <DrivingLicenceComponent />
        </div>
    );
};

export default page;
