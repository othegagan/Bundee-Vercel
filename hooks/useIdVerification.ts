import axios from 'axios';
import { useState } from 'react';

interface VerificationPayload {
    frontImageBase64: string;
    backOrSecondImageBase64: string;
    faceImageBase64: string;
    documentType: number;
    trackString: { data: string; barcodeParams: string };
    overriddenSettings: { isOCREnabled: boolean; isBackOrSecondImageProcessingEnabled: boolean; isFaceMatchEnabled: boolean };
    metadata: { captureMethod: string };
}

interface VerificationResult {
    requestId: string;
    expiryDate: string;
    documentVerificationResult: { documentConfidence: number };
    faceMatchVerificationResult: { faceMatchConfidence: number };
    antiSpoofingVerificationResult: { antiSpoofingFaceImageConfidence: number };
}

const VERIFY_URL = 'https://dvs2.idware.net/api/v4/verify';

const thresholds = {
    documentConfidence: 90,
    faceMatchConfidence: 90,
    antiSpoofingFaceImageConfidence: 90,
    addressValidation: 90,
    dmvValidation: 90,
    identiFraudValidation: 90
};

export function useIdVerification() {
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

    const verifyDrivingLicence = async (payload: VerificationPayload) => {
        setIsVerifying(true);
        setError(null);
        setVerificationResult(null);

        try {
            const response = await axios.post(VERIFY_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_IDSCAN_BEARER_TOKEN}`
                }
            });

            setVerificationResult(response.data);

            const result = response.data;

            const { documentVerificationResult, faceMatchVerificationResult, antiSpoofingVerificationResult } = result;

            const documentConfidence = documentVerificationResult.documentConfidence >= thresholds.documentConfidence;
            const faceMatchConfidence = faceMatchVerificationResult.faceMatchConfidence >= thresholds.faceMatchConfidence;
            const antiSpoofingConfidence = antiSpoofingVerificationResult.antiSpoofingFaceImageConfidence >= thresholds.antiSpoofingFaceImageConfidence;

            const addressValidation = result.externalVerificationResults?.find((v: any) => v.name === 'AddressValidation') || false;
            const dmvValidation = result.externalVerificationResults?.find((v: any) => v.name === 'DMVValidation') || false;
            const identiFraudValidation = result.externalVerificationResults?.find((v: any) => v.name === 'IdentiFraudValidation') || false;

            const addressValidationScore = addressValidation?.values?.[0]?.score >= thresholds.addressValidation || false;
            const dmvValidationScore = dmvValidation?.values?.every((field: any) => field.score >= thresholds.dmvValidation) || false;
            const identiFraudValidationScore = identiFraudValidation?.values?.every((field: any) => field.score >= thresholds.identiFraudValidation) || false;

            const isApproved =
                documentConfidence &&
                faceMatchConfidence &&
                antiSpoofingConfidence &&
                addressValidationScore &&
                dmvValidationScore &&
                identiFraudValidationScore;

            if (!isApproved) {
                setError('The provided documents did not meet the required confidence thresholds. Please try again with clearer images.');
            }

            const expiryDate = response.data.document.expires ? new Date(response.data.document.expires).toISOString() : null;

            return { isApproved, requestId: response.data.requestId, expiryDate };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(`API Error: ${error.response?.data?.message || error.message}`);
            } else {
                setError('An unexpected error occurred during verification.');
            }
            return { isApproved: false, requestId: null };
        } finally {
            setIsVerifying(false);
        }
    };

    return { verifyDrivingLicence, isVerifying, error, verificationResult };
}
