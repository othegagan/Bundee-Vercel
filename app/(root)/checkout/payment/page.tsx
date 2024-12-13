'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import type React from 'react';
import { useCheckoutDetails } from '../useCheckoutDetails';
import StripePaymentComponent from './StripePaymentComponent';

const depositAmount = '$250';

const note1 = 'In the event that your reservation is not accepted by the host, any amount charged to your card will be fully refunded.';
const note2 = `Note: A refundable security deposit of ${depositAmount} will be authorized on all modes of payment.`;

function Note({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex flex-col gap-2'>
            <h2 className='font-bold text-xl'>Payment</h2>
            <p>Enter your card details below to complete your reservation.</p>

            <div className='mb-2 text-muted-foreground text-xs'>{note1}</div>
            <div className='mb-4 text-muted-foreground text-xs'>{note2}</div>
            {children}
        </div>
    );
}

export default function page() {
    const { loading, error } = useCheckoutDetails();

    if (error) return <ErrorComponent />;

    if (loading)
        return (
            <Note>
                <CheckoutCardSkeleton />
            </Note>
        );

    return (
        <Note>
            <StripePaymentComponent />
        </Note>
    );
}
