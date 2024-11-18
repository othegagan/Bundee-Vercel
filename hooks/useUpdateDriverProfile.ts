'use client';

import { useIdVerification } from '@/hooks/useIdVerification';
import { getSession } from '@/lib/auth';
import { updateDrivingLicence } from '@/server/userOperations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useUpdateDriverProfile() {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
    const { verifyDrivingLicence, isVerifying, error: verificationError } = useIdVerification();
    const [isLicenseApproved, setIsLicenseApproved] = useState(false);

    const updateQueryParam = (status: 'true' | 'false') => {
        const params = new URLSearchParams(window.location.search);
        params.set('drivinglicenseverified', status);
        const updatedURL = `${window.location.pathname}?${params.toString()}`;
        router.push(updatedURL);
    };

    const handleUpdateDriverProfile = async (idScanPayload: any, decryptedUserId?: string) => {
        setIsUpdating(true);
        setErrorMessage(null);
        setIsUpdateSuccessful(false);

        try {
            const session = await getSession();
            const userId = Number(decryptedUserId) || session.userId;

            const { isApproved, requestId, expiryDate } = await verifyDrivingLicence(idScanPayload);

            const updatePayload = {
                userId: userId,
                idScanRequestID: requestId,
                isVerified: isApproved,
                expiryDate: expiryDate,
                drivingLicenseStatus: isApproved ? 'verified' : 'failed'
            };

            const updateResponse = await updateDrivingLicence(updatePayload);
            if (updateResponse.success) {
                setIsUpdateSuccessful(true);
                updateQueryParam('true');
            } else {
                throw new Error(updateResponse.message || 'Failed to update driving profile');
            }
            setIsLicenseApproved(isApproved);

            updateQueryParam(isApproved ? 'true' : 'false');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred while updating your driving profile');
            updateQueryParam('false');
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        isUpdating,
        updateError: errorMessage || verificationError,
        isUpdateSuccessful,
        handleUpdateDriverProfile,
        isVerifying,
        isLicenseApproved
    };
}
