import { decryptingData } from "@/lib/decrypt";
import { useRouter } from "next/router";
import { useState } from "react";
import { verifyDrivingProfile } from "./useDrivingProfile";

export function useUpdateDriverProfile() {
    const router = useRouter();
    const [isUpdatingDB, setIsUpdatingDB] = useState(false);
    const [errorUpdatingDB, setErrorUpdatingDB] = useState('');
    const [success, setSuccess] = useState(false);

    const updateURL = (status: 'true' | 'false') => {
        const params = new URLSearchParams(window.location.search);
        params.set('drivinglicenseverified', status);

        const url = `${window.location.pathname}?${params.toString()}`;
        router.push(url);
    };

    const updateDriverProfile = async (payload: any, token: string) => {
        setIsUpdatingDB(true);
        setErrorUpdatingDB('');
        setSuccess(false);

        try {
            const userId = Number(decryptingData(token));
            const response = await verifyDrivingProfile(payload, userId);

            if (response.success) {
                setSuccess(true);
                updateURL('true');
            } else {
                throw new Error(response.message || 'Failed to update driving profile');
            }
        } catch (error) {
            setErrorUpdatingDB(error instanceof Error ? error.message : 'An error occurred while updating your driving profile');
            updateURL('false');
        } finally {
            setIsUpdatingDB(false);
        }
    };

    return { isUpdatingDB, errorUpdatingDB, success, updateDriverProfile };
}