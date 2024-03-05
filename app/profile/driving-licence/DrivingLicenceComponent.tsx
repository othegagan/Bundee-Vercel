'use client';

import { getUserExistOrNotConfirmation } from '@/app/_actions/check_user_exist';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { Button } from '@/components/ui/button';
import usePersona from '@/hooks/usePersona';
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

        const bundee_auth_token = localStorage.getItem('bundee_auth_token');
        const email = localStorage.getItem('session_user');

        const userCheckData = {
            channelName: 'Bundee',
            email: email,
        };

        const fetchUser = async () => {
            try {
                const confirmationData = await getUserExistOrNotConfirmation(userCheckData, bundee_auth_token);
                const isPersonaVerified = confirmationData['isPersonaVerified'] == false ? false : true;

                if (confirmationData.errorcode == 1) {
                    setError(true);
                    throw new Error('Error in fetchUser');
                }

                if (confirmationData.personaEnquiryId) {
                    await getVerifiedDetailsFromPersona(confirmationData.personaEnquiryId);
                }

                setIsVerfied(isPersonaVerified);
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
            // await new Promise(resolve => setTimeout(resolve, 5000));

            const data = await getDetailsFromPersona(personaEnquiryId);
            // console.log(data);
            setVerifiedDetails(data || null);
        } catch (error) {
            console.error('Error in getVerifiedDetailsFromPersona:', error);
        }
    };

    if (isloading) {
        return <div className='flex justify-center items-center mt-10'>Loading...</div>;
    }

    if (error) {
        return <ErrorComponent />;
    }

    return (
        <>
            {isVerified ? (
                <>
                    {verifiedDetails ? (
                        <div className='space-y-6 mt-8'>
                            <p className='text-sm'>Your driving license details are verified. Please make sure that the details are correct. If not, please update them.</p>
                            <div className='max-w-[400px] w-full space-y-4'>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'>First Name</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['name-first']['value'] || '-'}</p>
                                </div>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'> Last Name</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['name-last']['value'] || '-'}</p>
                                </div>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'> Identification Number</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['identification-number']['value'] || ' - '}</p>
                                </div>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'>Address 1 </p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-street-1']['value'] || '-'}</p>
                                </div>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'> Address 2</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-street-2']['value'] || '-'}</p>
                                </div>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'> City</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-city']['value'] || '-'}</p>
                                </div>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'> State</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-subdivision']['value'] || '-'}</p>
                                </div>
                                <div className='flex gap-3 items-center w-full'>
                                    <p className='block w-[50%] font-medium text-sm'> Country</p>
                                    <p className='block text-sm text-primary'>{verifiedDetails['address-country-code']['value'] || '-'}</p>
                                </div>
                            </div>

                            <div className='flex justify-end '>
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
                                            <div className='loader'></div>
                                        </div>
                                    ) : (
                                        <p> Update Driving License.</p>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className='mt-10 text-base '>Something went wrong fetching details.</p>
                    )}
                </>
            ) : (
                <div className=' flex flex-col gap-3 mt-12'>
                    <p className='block font-semibold text-base'>Oops, Your Profile is not verified, Please continue to verify your driving license.</p>

                    <div className='flex justify-end'>
                        {' '}
                        <Button
                            type='button'
                            onClick={() => {
                                createClient(setShowPersona);
                            }}
                            disabled={isPersonaClientLoading}
                            className='bg-primary'>
                            {isPersonaClientLoading ? (
                                <div className='flex px-16'>
                                    <div className='loader'></div>
                                </div>
                            ) : (
                                <p> Continue Verification</p>
                            )}
                        </Button>
                    </div>
                </div>
            )}

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
