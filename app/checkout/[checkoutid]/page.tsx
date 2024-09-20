'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { CheckoutCardSkeleton, CheckoutDetailsSkeleton } from '@/components/skeletons/skeletons';
import BackButton from '@/components/custom/BackButton';
import CheckoutDetails, { useCheckoutDetails } from './CheckoutDetails';
import StripePaymentComponent from './StripePaymentComponent';

export default function page() {
    const { loading, error } = useCheckoutDetails();

    if (error) return <ErrorComponent />;

    // Shared layout structure
    const Layout = ({ children }: { children: React.ReactNode }) => (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:max-w-4xl w-full container md:pt-10 py-6 md:gap-6 px-4'>
            <div className='md:border-r md:pr-6'>
                <div className='mb-6'>
                    <BackButton />
                    {children}
                </div>
            </div>
            <div>
                <h2 className='mb-6 text-2xl font-bold'>Pay with card</h2>
                {loading ? <CheckoutCardSkeleton /> : <StripePaymentComponent />}
            </div>
        </div>
    );

    return <Layout>{loading ? <CheckoutDetailsSkeleton /> : <CheckoutDetails />}</Layout>;
}
