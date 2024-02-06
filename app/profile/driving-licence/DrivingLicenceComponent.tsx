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
    const { isPersonaClientLoading, createClient, personaUpdated } = usePersona();
    const [error, setError] = useState(false);

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

                if(confirmationData.errorcode == 1){
                    setError(true);
                    throw new Error('Error in fetchUser');
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

    if (isloading) {
        return <div className='flex justify-center items-center mt-10'>Loading...</div>;
    }

    if (error) {
        return <ErrorComponent />;
    }

    return (
        <>
            {isVerified ? (
                <div className=' flex justify-center'>
                    <h1 className='text-lg text-center mt-20'>You have already verified your driving license.</h1>
                </div>
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
