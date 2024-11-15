'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import { useCheckoutDetails } from '../useCheckoutDetails';
import StripePaymentComponent from './StripePaymentComponent';

const depositAmount = '$250';

export default function page() {
    const { loading, error } = useCheckoutDetails();

    if (error) return <ErrorComponent />;

    if (loading)
        return (
            <div className='flex flex-col gap-2'>
                <h2 className='font-bold text-xl'>Payment</h2>
                <p>Enter your card details below to complete your reservation.</p>
                <div className='mb-2 text-muted-foreground text-xs'>
                    In the event that your reservation is not accepted by the host, any amount charged to your card will be fully refunded.
                </div>
                <div className='mb-4 text-muted-foreground text-xs'>
                    Note: A refundable security deposit of {depositAmount} will be authorized on payments done through debit cards.
                </div>
                <CheckoutCardSkeleton />
            </div>
        );

    return (
        <div className='flex flex-col gap-2'>
            <h2 className='font-bold text-xl'>Payment</h2>
            <p>Enter your card details below to complete your reservation.</p>

            <div className='mb-2 text-muted-foreground text-xs'>
                In the event that your reservation is not accepted by the host, any amount charged to your card will be fully refunded.
            </div>
            <div className='mb-4 text-muted-foreground text-xs'>
                Note: A refundable security deposit of {depositAmount} will be authorized on payments done through debit cards.
            </div>
            <StripePaymentComponent />
        </div>
    );
}
