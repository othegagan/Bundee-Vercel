'use client';
import { useState, useRef } from 'react';
import * as PersonaVerification from 'persona';

import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/server/userOperations';
import { getVerifiedDetailsFromPersona, updatePersonaProfile } from '@/server/personaOperations';

const usePersona = () => {
    const isDevelopmentOrTest = process.env.NEXT_PUBLIC_APP_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'test';

    const options = {
        templateId: isDevelopmentOrTest ? 'itmpl_oFwr5vDFxPnJVnpKmXpgxY5x' : 'itmpl_oFwr5vDFxPnJVnpKmXpgxY5x',
        environmentId: isDevelopmentOrTest ? 'env_3gPXHtfowwicvW8eh5GdW9PV' : 'env_dvc87Vi6niSk1hQoArHedbn1',
    };

    const [isPersonaClientLoading, setPersonaClientLoading] = useState(false);
    const [personaUpdated, setPersonaUpdated] = useState(false);
    const embeddedClientRef = useRef(null);

    const createClient = setShowPersona => {
        setPersonaClientLoading(true);
        const environment = isDevelopmentOrTest ? 'sandbox' : 'production';

        const client = new PersonaVerification.Client({
            ...options,
            environment: environment,
            //@ts-ignore
            onLoad: (error: any) => {
                if (error) {
                    console.error(`Failed with code: ${error.code} and message ${error.message}`);
                }

                client.open();
                setPersonaClientLoading(false);
                setShowPersona(false);
            },
            onStart: inquiryId => {
                console.log(`Started inquiry ${inquiryId}`);
            },
            onComplete: async ({ inquiryId, status }) => {
                try {
                    console.log(inquiryId);
                    await updateDrivingProfile(inquiryId, status);
                } catch (error) {
                    alert(`Error while driving license: ${error}`);
                }
            },
            onEvent: (name, meta) => {
                switch (name) {
                    case 'start':
                        // console.log(`Received event: start`);
                        break;
                    case 'load-camera-failed':
                        // console.log(`Received event: load-camera-failed`);
                        break;
                    default:
                    // console.log(`Received event: ${name} with meta: ${JSON.stringify(meta)}`);
                }
            },
            onCancel() {
                console.log(`Canceling inquiry`);
                client.cancel(true);
                client.destroy();
                setPersonaClientLoading(false);
                setShowPersona(false);
            },
        });

        embeddedClientRef.current = client;

        //@ts-ignore
        window.exit = () => (client ? client.exit(true) : alert('Initialize client first'));
    };

    const updateDrivingProfile = async (inquiryId, status) => {
        setPersonaClientLoading(true);

        try {
            const userID = localStorage.getItem('userId');

            const res = await updatePersonaProfile(inquiryId);
            if (res.success) {
                setPersonaUpdated(true);
                // alert(`Complete with status ${res.success}`);
                //@ts-ignore
                embeddedClientRef.current.exit(true);
            } else {
                setPersonaUpdated(false);
                // alert(`Error while updating Driving license`);
            }
        } catch (e) {
            console.error('Error in handleComplete:', e);
        } finally {
            setPersonaClientLoading(false);
        }
    };

    const getDetailsFromPersona = async (inquiryId: string) => {
        try {
            const response = await getVerifiedDetailsFromPersona(inquiryId);
            return response;
        } catch (error: any) {
            console.log(error);
        }
    };

    return { options, isPersonaClientLoading, createClient, updateDrivingProfile, personaUpdated, embeddedClientRef, getDetailsFromPersona };
};

export default usePersona;

export async function profileVerifiedStatus() {
    const session = await getSession();
    const userResponse = await getUserByEmail(session.email);

    if (userResponse.success) {
        const isPersonaVerified = userResponse.data?.driverProfiles?.length == 0 ? false : true;
        return isPersonaVerified;
    }
}
