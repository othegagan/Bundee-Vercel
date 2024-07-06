"use client";

import ErrorComponent from "@/components/custom/ErrorComponent";
import { CheckoutCardSkeleton, CheckoutDetailsSkeleton } from "@/components/skeletons/skeletons";
import BackButton from "../../../components/custom/BackButton";
import CheckoutDetails, { useCheckoutDetails } from "./CheckoutDetails";
import StripePaymentComponent from "./StripePaymentComponent";

export default function page() {
    const { loading, error } = useCheckoutDetails();

    if (loading)
        return (
            <div className='flex justify-center py-6 '>
                <div className='flex flex-col md:max-w-5xl md:flex-row'>
                    <div className='flex flex-col border-r p-8 pt-4 md:w-1/2'>
                        <div className=' mb-6 flex  flex-col items-start justify-start'>
                            <BackButton />
                            <CheckoutDetailsSkeleton />
                        </div>
                    </div>
                    <div className='mt-4 flex flex-col p-8 md:w-1/2'>
                        <h2 className='mb-6 text-2xl font-bold'>Pay with card</h2>
                        <CheckoutCardSkeleton />
                    </div>
                </div>
            </div>
        );

    if (error) return <ErrorComponent />;

    return (
        <div className='flex justify-center py-6'>
            <div className='flex flex-col md:max-w-4xl md:flex-row'>
                <div className='flex flex-col border-r p-8 pt-4 md:w-1/2'>
                    <div className=' mb-6 flex items-center'>
                        <BackButton />
                    </div>
                    <CheckoutDetails />
                </div>
                <div className='flex flex-col p-8 md:w-1/2'>
                    <h2 className='mb-6 text-2xl font-bold'>Pay with card</h2>
                    <StripePaymentComponent />
                </div>
            </div>
        </div>
    );
}
