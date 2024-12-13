'use client';

import { DrivingLicenceDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { useVerifiedDrivingProfile } from '@/hooks/useDrivingProfile';
import { getSession } from '@/lib/auth';
import { encryptingData } from '@/lib/decrypt';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const DrivingLicenceComponent = () => {
    const { data: response, isLoading, error } = useVerifiedDrivingProfile();

    if (isLoading) {
        return <DrivingLicenceDetailsSkeleton />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const { isDrivingProfileVerified, verifiedDetails } = response || {};

    if (!isDrivingProfileVerified || !verifiedDetails) {
        return <UnverifiedComponent />;
    }

    const { images, scores, personalInfo } = verifiedDetails;

    return <VerifiedDetailsComponent personalInfo={personalInfo} images={images} scores={scores} />;
};

export default DrivingLicenceComponent;

function VerifiedDetailsComponent({ personalInfo, images, scores }) {
    const [redirectUrl, setRedirectUrl] = useState<string>('');

    useEffect(() => {
        async function generateRedirectUrl() {
            try {
                const session = await getSession();
                const encryptUserId = encryptingData(String(session.userId));
                const url = `/driving_licence_verification?callbackUrl=${encodeURIComponent(window.location.href)}&token=${encryptUserId}`;
                setRedirectUrl(url);
            } catch (error) {
                console.error('Error generating redirect URL:', error);
            }
        }

        generateRedirectUrl();
    }, []);

    return (
        <div>
            <p className='mt-4 max-w-2xl text-neutral-500 text-sm leading-snug'>
                Your driving licence details are verified. <br /> Please make sure that the details are correct. If not, please update them.
            </p>
            <div className='mt-6 border-neutral-100 border-t'>
                <dl className='divide-y divide-neutral-100'>
                    <Field label='Full name'>{personalInfo.fullName}</Field>
                    <Field label='Date of Birth'>{personalInfo.dob}</Field>
                    <Field label='Address'>{personalInfo.fullAddress}</Field>
                    <Field label='Driving Licence Number'>{personalInfo.drivingLicenceNumber}</Field>
                    <Field label='Expires on'>{personalInfo.expires}</Field>
                    <dd className='flex flex-col gap-4 pt-4 text-neutral-900 text-sm sm:col-span-2 sm:flex-row'>
                        <Attachment photoUrl={images.selfie} altText='Driver photo' description='Driver Selfie' />
                        <Attachment photoUrl={images.front} altText='Driving Licence Front photo' description='Driving Licence Front photo' />
                        <Attachment photoUrl={images.back} altText='Driving Licence Back photo' description='Driving Licence Back photo' />
                    </dd>
                </dl>
            </div>

            <div className='mt-6 flex justify-end'>
                <Link href={redirectUrl}>
                    <Button type='button' variant='black'>
                        Update Driving Licence
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function UnverifiedComponent() {
    const [redirectUrl, setRedirectUrl] = useState<string>('');

    useEffect(() => {
        async function generateRedirectUrl() {
            try {
                const session = await getSession();
                const encryptUserId = encryptingData(String(session.userId));
                const url = `/driving_licence_verification?callbackUrl=${encodeURIComponent(window.location.href)}&token=${encryptUserId}`;
                setRedirectUrl(url);
            } catch (error) {
                console.error('Error generating redirect URL:', error);
            }
        }

        generateRedirectUrl();
    }, []);

    return (
        <div className='mt-12 flex flex-col gap-3'>
            <p className='mt-4 max-w-2xl text-neutral-500 text-sm leading-snug'>Your driving licence has not yet been verified. Please verify it.</p>
            <div className='mt-6 flex justify-end'>
                <Link href={redirectUrl}>
                    <Button type='button' variant='black'>
                        Verify Driving Licence
                    </Button>
                </Link>
            </div>
        </div>
    );
}

const Attachment = ({ photoUrl, altText, description }) => (
    <div className='flex flex-col gap-1 md:w-[40%]'>
        <div className='aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-32 lg:w-[200px] '>
            <img src={`data:image/jpeg;base64,${photoUrl}`} alt={altText} className='objectbg-center h-full w-full object-cover' />
        </div>
        <p className='text-center text-[12px]'>{description}</p>
    </div>
);

const Field = ({ label, children }: { label: string; children: any }) => (
    <div className='px-2 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
        <dt className='font-medium text-neutral-900 text-sm leading-6'>{label}</dt>
        <dd className='mt-1 text-neutral-700 text-sm leading-6 sm:col-span-2 sm:mt-0'>{children}</dd>
    </div>
);
