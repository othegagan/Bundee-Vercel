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
    priceCalculatedList: any;
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
        priceCalculatedList,
        paymentMethod
    }: UseTripModificationProps) {
        setSubmitting(true);
        try {
            const { userId } = await getSession();
            const payload = {
                tripid,
                userId: String(userId),
                startTime: convertToCarTimeZoneISO(`${newStartDate}T${newStartTime}`, vehzipcode),
                endTime: convertToCarTimeZoneISO(`${newEndDate}T${newEndTime}`, vehzipcode),
                pickupTime: newStartTime,
                dropTime: newEndTime,
                totalDays: String(priceCalculatedList.numberOfDays),
                taxAmount: priceCalculatedList.taxAmount,
                tripTaxAmount: priceCalculatedList?.tripTaxAmount,
                totalamount: priceCalculatedList.totalAmount,
                tripamount: String(priceCalculatedList.tripAmount),
                upCharges: priceCalculatedList.upcharges,
                deliveryCost: priceCalculatedList.delivery,
                perDayAmount: priceCalculatedList.pricePerDay,
                extreaMilageCost: 0,
                isPaymentChanged: true,
                Statesurchargeamount: priceCalculatedList.stateSurchargeAmount,
                Statesurchargetax: priceCalculatedList.stateSurchargeTax,
                changedBy: 'USER',
                ...priceCalculatedList,
                paymentauthorizationconfigid: 1,
                deductionfrequencyconfigid: 1,
                authorizationpercentage: priceCalculatedList.authPercentage,
                authorizationamount: priceCalculatedList.authAmount,
                paymentMethodIDToken: paymentMethod || null,
                comments: ''
            };

            const fieldsToRemove = [
                'authAmount',
                'authPercentage',
                'delivery',
                'hostPriceMap',
                'numberOfDays',
                'pricePerDay',
                'stateSurchargeAmount',
                'stateSurchargeTax',
                'totalAmount',
                'tripAmount',
                'upcharges'
            ];

            fieldsToRemove.forEach((field) => delete payload[field]);

            const response = type === 'reduction' ? await createTripReduction(payload) : await createTripExtension(payload);

            console.log('Extensionresponse', response);
            if (response.success) {
                setSuccess(true);
                tripModificationModal.setSuccess(true);
            } else {
                setSuccess(false);
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
