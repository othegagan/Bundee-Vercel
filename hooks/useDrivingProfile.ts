'use client';

import { getSession } from '@/lib/auth';
import { getVerifiedDetailsFromIDScan, updateDrivingProfile } from '@/server/drivingLicenceOperations';
import { getUserByEmail } from '@/server/userOperations';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export async function profileVerifiedStatus() {
    const session = await getSession();
    const userResponse = await getUserByEmail(session.email);

    if (userResponse.success) {
        const isPersonaVerified = !!userResponse.data?.driverProfiles[0]?.personaEnquiryId;
        return isPersonaVerified;
    }
}

interface VerifiedDrivingProfileResult {
    isDrivingProfileVerified: boolean;
    verifiedDetails: any | null;
}

export const useVerifiedDrivingProfile = () => {
    return useQuery<VerifiedDrivingProfileResult, Error>({
        queryKey: ['drivingProfile'],
        queryFn: async (): Promise<VerifiedDrivingProfileResult> => {
            const session = await getSession();
            const userResponse = await getUserByEmail(session.email);

            if (userResponse.success) {
                const isDrivingProfileVerified = !!userResponse.data?.driverProfiles[0]?.personaEnquiryId;
                const drivingProfileId = userResponse.data?.driverProfiles?.length === 0 ? null : userResponse.data?.driverProfiles[0]?.personaEnquiryId;

                if (drivingProfileId) {
                    const verifiedDetails = await getVerifiedDetailsFromIDScan(drivingProfileId);
                    return {
                        isDrivingProfileVerified,
                        verifiedDetails
                    };
                }

                return {
                    isDrivingProfileVerified,
                    verifiedDetails: null
                };
            }

            throw new Error('Failed to fetch user data');
        },
        refetchOnWindowFocus: true,
        staleTime: 30 * 1000
    });
};

export async function verifyDrivingProfile(payload: any) {
    try {
        const verifyUrl = 'https://dvs2.idware.net/api/v4/verify';

        const response = await axios.post(verifyUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_IDSCAN_BEARER_TOKEN
            }
        });

        if (response.status === 200) {
            const responseData = response.data;
            // console.log('Success response:', responseData);

            if (responseData.requestId) {
                const updateIDResponse = await updateDrivingProfile(responseData.requestId);
                // console.log('updateIDResponse', updateIDResponse);
                return updateIDResponse;
            }
        } else {
            throw new Error(JSON.stringify(response.data));
        }
    } catch (error: any) {
        if (error.response) {
            throw new Error(JSON.stringify(error.response.data));
        }
        console.log('Error verifying driving profile:', error);
        throw new Error(error.message);
    }
}
