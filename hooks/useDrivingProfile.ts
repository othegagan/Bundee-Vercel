'use client';

import { getSession } from '@/lib/auth';
import { updateDrivingProfile } from '@/server/drivingLicenceOperations';
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

export const useVerifiedDrivingProfile = () => {
    return useQuery<VerifiedDrivingProfileResult, Error>({
        queryKey: ['drivingProfile'],
        queryFn: async (): Promise<VerifiedDrivingProfileResult> => {
            try {
                const session = await getSession();
                if (!session.email) {
                    throw new Error('User not authenticated');
                }

                const userResponse = await getUserByEmail(session.email);
                if (!userResponse.success || !userResponse.data) {
                    throw new Error('Failed to fetch user data');
                }

                const user = userResponse.data;
                const driverProfile = user.driverProfiles?.[0];
                const isDrivingProfileVerified = !!driverProfile?.personaEnquiryId;
                const drivingProfileId = driverProfile?.personaEnquiryId || null;

                if (drivingProfileId) {
                    try {
                        const verifiedDetails = await getVerifiedDetailsFromIDScan(drivingProfileId);
                        return {
                            isDrivingProfileVerified,
                            verifiedDetails
                        };
                    } catch (error) {
                        console.error('Failed to fetch verified details:', error);
                        return {
                            isDrivingProfileVerified,
                            verifiedDetails: null
                        };
                    }
                }

                return {
                    isDrivingProfileVerified,
                    verifiedDetails: null
                };
            } catch (error) {
                console.error('Error in useVerifiedDrivingProfile:', error);
                throw error;
            }
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

export async function getVerifiedDetailsFromIDScan(requestId: string): Promise<PrasedData> {
    try {
        const url = `https://dvs2.idware.net/api/v3/Request/${requestId}/result`;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_IDSCAN_BEARER_TOKEN}`
            }
        });

        if (response.status === 200) {
            const { verificationResult, request } = response.data;
            const { document, documentVerificationResult, faceVerificationResult } = verificationResult;

            // Extract images
            const images = {
                selfie: request.content.faceImageBase64,
                front: request.content.frontImageBase64,
                back: request.content.backOrSecondImageBase64
            };

            // Extract scores
            const scores = {
                documentConfidence: documentVerificationResult.totalConfidence,
                antiSpoofing: faceVerificationResult.antiSpoofing,
                faceMatch: faceVerificationResult.confidence,
                addressConfidence: documentVerificationResult.verificationConfidence.address,

                dmvValidation: documentVerificationResult.validationTests.find((test: any) => test.name === 'DMVValidation')?.statusString || 'Not Available',
                dmvReason: documentVerificationResult.validationTests.find((test: any) => test.name === 'DMNVValidation')?.reason || 'Not Available',

                addressValidation: documentVerificationResult.validationTests.find((test: any) => test.name === 'AddressValidation')?.statusString || 'Not Available',
                addressReason: documentVerificationResult.validationTests.find((test: any) => test.name === 'AddressValidation')?.reason || 'Not Available',

                identiFraudValidation: documentVerificationResult.validationTests.find((test: any) => test.name === 'IdentiFraudValidation')?.statusString || 'Not Available',
                identiFraudReason: documentVerificationResult.validationTests.find((test: any) => test.name === 'IdentiFraudValidation')?.reason || 'Not Available'
            };

            // Extract personal information
            const personalInfo = {
                fullName: document.fullName,
                dob: document.dob,
                expires: document.expires,
                fullAddress: `${document.address}, ${document.city}, ${document.state} ${document.zip}`,
                class: document.class,
                gender: document.gender,
                drivingLicenceNumber: document.id
            };

            return {
                images,
                scores,
                personalInfo
            };
        }

        return null;
    } catch (error) {
        console.error(error);
    }
}

interface PrasedData {
    images: {
        selfie: string;
        front: string;
        back: string;
    };
    scores: {
        documentConfidence: number;
        antiSpoofing: number;
        faceMatch: number;
        addressConfidence: number;
        dmvValidation: string;
        dmvReason: string;
        addressValidation: string;
        addressReason: string;
        identiFraudValidation: string;
        identiFraudReason: string;
    };
    personalInfo: {
        fullName: string;
        dob: string;
        expires: string;
        fullAddress: string;
        class: string;
        gender: string;
        drivingLicenceNumber: string;
    };
}

interface VerifiedDrivingProfileResult {
    isDrivingProfileVerified: boolean;
    verifiedDetails: any | null;
}
