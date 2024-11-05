'use client';

import { getSession } from '@/lib/auth';
import { http } from '@/lib/httpService';
import { getUserByEmail } from '@/server/userOperations';
import type { PrasedData, VerifiedDrivingProfileResult } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export async function profileVerifiedStatus() {
    const session = await getSession();
    const userResponse = await getUserByEmail(session.email);

    if (userResponse.success) {
        const isDrivingLicenceVerified = !!userResponse.data?.driverProfiles[0]?.isVerified;
        return isDrivingLicenceVerified;
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
                const isDrivingProfileVerified = driverProfile?.isVerified;
                const drivingProfileId = driverProfile?.idScanRequestID || null;

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
        staleTime: 6 * 1000
    });
};

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

                addressValidation:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'AddressValidation')?.statusString || 'Not Available',
                addressReason: documentVerificationResult.validationTests.find((test: any) => test.name === 'AddressValidation')?.reason || 'Not Available',

                identiFraudValidation:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'IdentiFraudValidation')?.statusString || 'Not Available',
                identiFraudReason:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'IdentiFraudValidation')?.reason || 'Not Available'
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

export const useInsuranceDetails = () => {
    return useQuery({
        queryKey: ['insuranceDetails'],
        queryFn: async () => {
            const session = await getSession();
            return getUserByEmail(session.email);
        },
        refetchOnWindowFocus: true,
        staleTime: 6 * 1000
    });
};

export const useGenerateInsuranceVerificationLink = () => {
    return useQuery({
        queryKey: ['generateInsuranceVerificationLink'],
        queryFn: async () => {
            const session = await getSession();
            const url = `${process.env.NEXT_PUBLIC_AUXILIARY_SERVICE_BASEURL}api/v1/insurance/datarequests/generate_invitation_link`;
            console.log('url', url);
            const response = await http.get(`${url}?userId=${session.userId}`);
            return response.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 3 * 1000,
        enabled: false
    });
};
