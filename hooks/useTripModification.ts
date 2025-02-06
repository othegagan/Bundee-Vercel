import { createTripExtension, createTripReduction } from '@/hooks/useCheckout';
import { getSession } from '@/lib/auth';
import { convertToCarTimeZoneISO } from '@/lib/utils';
import { useState } from 'react';
import useTripModificationDialog from './dialogHooks/useTripModificationDialog';

interface UseTripModificationProps {
    type?: 'reduction' | 'extension';
    tripid: number;
    vehzipcode: string;
    userId?: number;
    newStartDate: string;
    newEndDate: string;
    newStartTime: string;
    newEndTime: string;
    paymentMethod: string | null;
}

export default function useTripModification() {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const tripModificationModal = useTripModificationDialog();

    async function handleTripModification({
        type,
        tripid,
        vehzipcode,
        newStartDate,
        newEndDate,
        newStartTime,
        newEndTime,
        paymentMethod
    }: UseTripModificationProps) {
        setSubmitting(true);
        try {
            const { userId } = await getSession();

            const payload = {
                tripid,
                userId,
                startTime: convertToCarTimeZoneISO(`${newStartDate}T${newStartTime}`, vehzipcode),
                endTime: convertToCarTimeZoneISO(`${newEndDate}T${newEndTime}`, vehzipcode),
                isPaymentChanged: true,
                changedBy: 'USER',
                paymentMethodIDToken: paymentMethod || null,
                comments: ''
            };

            const response = type === 'reduction' ? await createTripReduction(payload) : await createTripExtension(payload);

            // console.log('Extensionresponse', response);
            if (response.success) {
                setSuccess(true);
                tripModificationModal.setSuccess(true);
            } else {
                setSuccess(false);
                tripModificationModal.setMessage(response.message);
                tripModificationModal.setSuccess(false);
            }
        } catch (error) {
            console.error(error);
            setSuccess(false);
            tripModificationModal.setSuccess(false);
        } finally {
            setSubmitting(false);
            setSubmitted(true);
            tripModificationModal.setSubmitted(true);
        }
    }

    return {
        submitting,
        submitted,
        success,
        handleTripModification
    };
}
