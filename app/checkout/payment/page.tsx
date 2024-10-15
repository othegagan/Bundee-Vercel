'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import { useCheckoutDetails } from '../useCheckoutDetails';
import StripePaymentComponent from './StripePaymentComponent';

export default function page() {
    const { loading, error } = useCheckoutDetails();

    if (error) return <ErrorComponent />;

    if (loading)
        return (
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold text-xl'>Payment</h2>
                <p>Enter your card details below to complete your reservation.</p>
                <CheckoutCardSkeleton />
            </div>
        );

    return (
        <div className='flex flex-col gap-3'>
            <h2 className='font-bold text-xl'>Payment</h2>
            <p>Enter your card details below to complete your reservation.</p>
            <StripePaymentComponent />
        </div>
    );
}
