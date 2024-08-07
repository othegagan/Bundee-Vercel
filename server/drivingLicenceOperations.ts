'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';
import axios from 'axios';

export async function updateDrivingProfile(requestId: string) {
    try {
        const session = await getSession();
        const url = `${process.env.USER_MANAGEMENT_BASEURL}/v1/user/createDriverProfile`;
        const payload = {
            personaEnquiryId: requestId,
            userId: session.userId
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getVerifiedDetailsFromIDScan(requestId: string): Promise<PrasedData> {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_IDSCAN_BEARER_TOKEN}`
        }
    };

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

                dmvValidation:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'DMVValidation')?.statusString ||
                    'Not Available',
                dmvReason:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'DMNVValidation')?.reason ||
                    'Not Available',

                addressValidation:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'AddressValidation')?.statusString ||
                    'Not Available',
                addressReason:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'AddressValidation')?.reason ||
                    'Not Available',

                identiFraudValidation:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'IdentiFraudValidation')?.statusString ||
                    'Not Available',
                identiFraudReason:
                    documentVerificationResult.validationTests.find((test: any) => test.name === 'IdentiFraudValidation')?.reason ||
                    'Not Available'
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
