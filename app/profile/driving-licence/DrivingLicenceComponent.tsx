'use client';

import { useEffect, useState } from 'react';
import usePersona from '@/hooks/usePersona';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/server/userOperations';
import { Button } from '@/components/ui/button';
import { DrivingLicenceDetailsSkeleton } from '@/components/skeletons/skeletons';
import ErrorComponent from '@/components/custom/ErrorComponent';

const DrivingLicenceComponent = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [showPersona, setShowPersona] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isPersonaClientLoading, createClient, personaUpdated, getDetailsFromPersona } = usePersona();
    const [error, setError] = useState(false);
    const [verifiedDetails, setVerifiedDetails] = useState<any>({});
    const [driverPhotoUrl, setDriverPhotoUrl] = useState<string | null>('');
    const [frontDrivingLicensePhotoUrl, setFrontDrivingLicensePhotoUrl] = useState<string | null>('');

    useEffect(() => {
        setIsLoading(true);

        const fetchUser = async () => {
            try {
                const session = await getSession();
                const userResponse = await getUserByEmail(session.email);
                if (userResponse.success) {
                    const isPersonaVerified = !!userResponse.data?.driverProfiles[0]?.personaEnquiryId;
                    const personaEnquiryId = userResponse.data?.driverProfiles?.length === 0 ? null : userResponse.data?.driverProfiles[0]?.personaEnquiryId;
                    if (personaEnquiryId) {
                        await getVerifiedDetailsFromPersona(personaEnquiryId);
                    }

                    setIsVerified(isPersonaVerified);
                } else {
                    setError(true);
                    throw new Error('Error in fetchUser');
                }
            } catch (error) {
                setError(true);
                console.error('Error in fetchUser:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [personaUpdated]);

    const getVerifiedDetailsFromPersona = async personaEnquiryId => {
        try {
            const data = await getDetailsFromPersona(personaEnquiryId);
            setVerifiedDetails(data.fields || null);
            setDriverPhotoUrl(data.centerDriverPhotoUrl || null);
            setFrontDrivingLicensePhotoUrl(data.frontDrivingLicensePhotoUrl || null);
        } catch (error) {
            console.error('Error in getVerifiedDetailsFromPersona:', error);
        }
    };

    if (isLoading) {
        return <DrivingLicenceDetailsSkeleton />;
    }

    if (error) {
        return <ErrorComponent />;
    }

    return (
        <>
            {isVerified ? (
                <VerifiedDetailsComponent
                    verifiedDetails={verifiedDetails}
                    driverPhotoUrl={driverPhotoUrl}
                    frontDrivingLicensePhotoUrl={frontDrivingLicensePhotoUrl}
                    createClient={createClient}
                    isPersonaClientLoading={isPersonaClientLoading}
                    setShowPersona={setShowPersona}
                />
            ) : (
                <UnverifiedComponent createClient={createClient} isPersonaClientLoading={isPersonaClientLoading} setShowPersona={setShowPersona} />
            )}
        </>
    );
};

export default DrivingLicenceComponent;

const VerifiedDetailsComponent = ({ verifiedDetails, driverPhotoUrl, frontDrivingLicensePhotoUrl, createClient, isPersonaClientLoading, setShowPersona }) => (
    <div>
        <p className='mt-4 max-w-2xl text-sm leading-snug text-neutral-500'>
            Your driving license details are verified. <br /> Please make sure that the details are correct. If not, please update them.
        </p>
        <div className='mt-6 border-t border-neutral-100'>
            <dl className='divide-y divide-neutral-100'>
                <Field label='Full name'>
                    {verifiedDetails['name-first'].value || ''} {verifiedDetails['name-last'].value || ''}
                </Field>
                <Field label='Identification Number'>{verifiedDetails['identification-number'].value || ' - '}</Field>
                <Field label='Address 1'>{verifiedDetails['address-street-1'].value || '-'}</Field>
                <Field label='Address 2'>{verifiedDetails['address-street-2'].value || '-'}</Field>
                <Field label='City'>{verifiedDetails['address-city'].value || '-'}</Field>
                <Field label='State'>{verifiedDetails['address-subdivision'].value || '-'}</Field>
                <Field label='Country'>{verifiedDetails['address-country-code'].value || '-'}</Field>

                <dd className='flex flex-col gap-4 pt-4 text-sm text-neutral-900 sm:col-span-2  lg:flex-row'>
                    <Attachment photoUrl={driverPhotoUrl} altText='Driver photo' description='Driver Selfie' />
                    <Attachment photoUrl={frontDrivingLicensePhotoUrl} altText='Driving Licence Front photo' description='Driving License Front photo' />
                </dd>
            </dl>
        </div>

        <div className='mt-6 flex justify-end'>
            <Button
                type='button'
                variant='black'
                size='sm'
                onClick={() => {
                    createClient(setShowPersona);
                }}
                disabled={isPersonaClientLoading}>
                {isPersonaClientLoading ? (
                    <div className='flex px-16'>
                        <div className='loader' />
                    </div>
                ) : (
                    <> Update Driving License</>
                )}
            </Button>
        </div>
    </div>
);

const UnverifiedComponent = ({ createClient, isPersonaClientLoading, setShowPersona }) => (
    <div className='mt-12 flex flex-col gap-3'>
        <p className='mt-4 max-w-2xl text-sm leading-snug text-neutral-500'>Your driving license has not yet been verified. Please verify it.</p>
        <div className='mt-6 flex justify-end'>
            <Button
                type='button'
                variant='black'
                onClick={() => {
                    createClient(setShowPersona);
                }}
                disabled={isPersonaClientLoading}>
                {isPersonaClientLoading ? (
                    <div className='flex px-16'>
                        <div className='loader' />
                    </div>
                ) : (
                    <>Verify driving license</>
                )}
            </Button>
        </div>
    </div>
);

const Attachment = ({ photoUrl, altText, description }) => (
    <div className='flex flex-col gap-1 lg:w-[40%]'>
        <div className='aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 lg:h-32 '>
            <img src={photoUrl} alt={altText} className='h-full w-full object-cover object-center lg:h-full lg:w-full' />
        </div>
        <p className='text-center text-[12px]'>{description}</p>
    </div>
);

const Field = ({ label, children }: { label: string; children: any }) => (
    <div className='px-2 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
        <dt className='text-sm font-medium leading-6 text-neutral-900'>{label}</dt>
        <dd className='mt-1 text-sm leading-6 text-neutral-700 sm:col-span-2 sm:mt-0'>{children}</dd>
    </div>
);
