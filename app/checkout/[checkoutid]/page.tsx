'use client';

import BackButton from '@/components/custom/BackButton';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { CheckoutCardSkeleton, CheckoutDetailsSkeleton } from '@/components/skeletons/skeletons';
import CheckoutDetails, { useCheckoutDetails } from './CheckoutDetails';
import StripePaymentComponent from './StripePaymentComponent';

export default function page() {
    const { loading, error } = useCheckoutDetails();

    if (error) return <ErrorComponent />;

    // Shared layout structure
    const Layout = ({ children }: { children: React.ReactNode }) => (
        <div className='container grid w-full grid-cols-1 gap-4 px-4 py-6 md:max-w-4xl md:grid-cols-2 md:gap-6 md:pt-10'>
            <div className='md:border-r md:pr-6'>
                <div className='mb-6'>
                    <BackButton />
                    {children}
                </div>
            </div>
            <div>
                <h2 className='mb-6 font-bold text-2xl'>Pay with card</h2>
                {loading ? <CheckoutCardSkeleton /> : <StripePaymentComponent />}
            </div>
        </div>
    );

    return <Layout>{loading ? <CheckoutDetailsSkeleton /> : <CheckoutDetails />}</Layout>;
}
