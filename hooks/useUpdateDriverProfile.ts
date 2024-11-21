'use client';

import { useIdVerification } from '@/hooks/useIdVerification';
import { getSession } from '@/lib/auth';
import { updateDrivingLicence } from '@/server/userOperations';
import { useState } from 'react';

export function useUpdateDriverProfile() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
    const { verifyDrivingLicence, isVerifying, error: verificationError } = useIdVerification();
    const [isLicenseApproved, setIsLicenseApproved] = useState(false);

    const handleUpdateDriverProfile = async (
        idScanPayload: any,
        decryptedUserId?: string
    ): Promise<{ success: boolean; isApproved?: boolean; error?: string }> => {
        setIsUpdating(true);
        setErrorMessage(null);
        setIsUpdateSuccessful(false);

        try {
            const session = await getSession();
            const userId = Number(decryptedUserId) || session.userId;

            const { isApproved, requestId, expiryDate } = await verifyDrivingLicence(idScanPayload);

            const updatePayload = {
                userId,
                idScanRequestID: requestId,
                isVerified: isApproved,
                expiryDate,
                drivingLicenseStatus: isApproved ? 'verified' : 'failed'
            };

            const updateResponse = await updateDrivingLicence(updatePayload);

            if (!updateResponse.success) {
                throw new Error(updateResponse.message || 'Failed to update driving profile');
            }

            setIsUpdateSuccessful(true);
            setIsLicenseApproved(isApproved);

            return { success: true, isApproved };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An error occurred while updating your driving profile';
            setErrorMessage(errorMsg);
            return { success: false, error: errorMsg };
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
