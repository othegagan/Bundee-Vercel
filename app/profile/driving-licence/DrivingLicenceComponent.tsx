'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { PersonaDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import usePersona from '@/hooks/usePersona';
import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/server/userOperations';
import { useEffect, useState } from 'react';

const DrivingLicenceComponent = () => {
    const [isVerified, setIsVerfied] = useState(false);
    const [showPersona, setShowPersona] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const { isPersonaClientLoading, createClient, personaUpdated, getDetailsFromPersona } = usePersona();
    const [error, setError] = useState(false);
    const [verifiedDetails, setVerifiedDetails] = useState<any>({});

    useEffect(() => {
        setIsLoading(true);

        const fetchUser = async () => {
            try {
                const session = await getSession();
                const userResponse = await getUserByEmail(session.email);
                if (userResponse.success) {
                    const isPersonaVerified = userResponse.data?.driverProfiles?.length == 0 ? false : true;
                    const personaEnquiryId = userResponse.data?.driverProfiles?.length == 0 ? null : userResponse.data?.driverProfiles[0]?.personaEnquiryId;
                    if (personaEnquiryId) {
                        await getVerifiedDetailsFromPersona(personaEnquiryId);
                    }

                    setIsVerfied(isPersonaVerified);
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

    const getVerifiedDetailsFromPersona = async (personaEnquiryId: any) => {
        try {
            const data = await getDetailsFromPersona(personaEnquiryId);
            // console.log(data);
            setVerifiedDetails(data || null);
        } catch (error) {
            console.error('Error in getVerifiedDetailsFromPersona:', error);
        }
    };

    if (isloading) {
        return (
            <div className='mt-16'>
                <PersonaDetailsSkeleton />
            </div>
        );
    }

    if (error) {
        return <ErrorComponent />;
    }

    return (
        <>
            {isVerified ? (
                <>
                    {verifiedDetails ? (
                        <div className='mt-8 space-y-6'>
                            <p className='text-sm'>
                                Your driving license details are verified. Please make sure that the details are correct. If not, please update them.
                            </p>
                            <div className='w-full max-w-[400px] space-y-4'>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'>First Name</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['name-first']['value'] || '-'}</p>
                                </div>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'> Last Name</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['name-last']['value'] || '-'}</p>
                                </div>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'> Identification Number</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['identification-number']['value'] || ' - '}</p>
                                </div>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'>Address 1 </p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-street-1']['value'] || '-'}</p>
                                </div>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'> Address 2</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-street-2']['value'] || '-'}</p>
                                </div>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'> City</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-city']['value'] || '-'}</p>
                                </div>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'> State</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-subdivision']['value'] || '-'}</p>
                                </div>
                                <div className='flex w-full items-center gap-3'>
                                    <p className='block w-[50%] text-sm font-medium'> Country</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-country-code']['value'] || '-'}</p>
                                </div>
                            </div>


                        </div>
                    ) : (
                        <p className='mt-10 text-base '>Unable to get verified details.Please update your driving license.</p>
                    )}
                </>
            ) : (
                <div className=' mt-12 flex flex-col gap-3'>
                    <h4>Oops, Your Profile is not verified, Please continue to verify your driving license.</h4>
                </div>
            )}

            <div className='flex justify-end mt-6'>
                {' '}
                <Button
                    type='button'
                    variant='black'
                    onClick={() => {
                        createClient(setShowPersona);
                    }}
                    disabled={isPersonaClientLoading}>
                    {isPersonaClientLoading ? (
                        <div className='flex px-16'>
                            <div className='loader'></div>
                        </div>
                    ) : (
                        <> Update Driving License</>
                    )}
                </Button>
            </div>

            {/* <div className='h-screen flex justify-center' style={{ width: '100%' }}>
                {process.env.NEXT_PUBLIC_APP_ENV === 'development' ? (
                    <PersonaInquiry
                        templateId='itmpl_oFwr5vDFxPnJVnpKmXpgxY5x'
                        environmentId='env_3gPXHtfowwicvW8eh5GdW9PV'
                        onLoad={() => console.log('Loaded inline')}
                        onComplete={handleComplete}
                    />
                ) : null}

                {process.env.NEXT_PUBLIC_APP_ENV === 'test' ? (
                    <PersonaInquiry
                        templateId='itmpl_oFwr5vDFxPnJVnpKmXpgxY5x'
                        environmentId='env_3gPXHtfowwicvW8eh5GdW9PV'
                        onLoad={() => console.log('Loaded inline')}
                        onComplete={handleComplete}
                    />
                ) : null}

                {process.env.NEXT_PUBLIC_APP_ENV === 'production' ? (
                    <PersonaInquiry templateId='itmpl_oFwr5vDFxPnJVnpKmXpgxY5x' environmentId='env_dvc87Vi6niSk1hQoArHedbn1' onComplete={handleComplete} />
                ) : null}
            </div> */}
        </>
    );
};

export default DrivingLicenceComponent;
