'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import { FaRegCheckCircle } from 'react-icons/fa';
import { IoWarning } from 'react-icons/io5';
import { useCheckoutDetails } from './CheckoutDetails';
import { createTripReservation } from '@/server/checkout';
import { toast } from '@/components/ui/use-toast';
import secureLocalStorage from 'react-secure-storage';

export default function CheckoutForm({ customerId }: { customerId: string }) {
    const [payment, setPayment] = useState<{
        status: 'initial' | 'processing' | 'error' | 'succeeded';
    }>({ status: 'initial' });

    const { data } = useCheckoutDetails();

    const [errorMessage, setErrorMessage] = useState<string>('');

    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
        try {
            e.preventDefault();
            // Abort if form isn't valid
            if (!e.currentTarget.reportValidity()) return;
            if (!elements || !stripe) return;

            setPayment({ status: 'processing' });

            const paymentRes = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: 'https://your-website.com/confirmation',
                },
                redirect: 'if_required',
            });

            const { setupIntent, error } = paymentRes;

            if (setupIntent) {
                const { id: setUpId, status, payment_method } = setupIntent;

                if (status === 'succeeded') {
                    console.log(setUpId, status, payment_method);

                    const payload = {
                        ...data,
                        stripePaymentToken: 'NA',
                        customerToken: customerId,
                        stripePaymentTransactionDetail: '{ "key1" : "val1" }',
                        stripePaymentID: 'NA',
                        paymentMethodIDToken: payment_method,
                        setupIntentToken: 'NA',
                        isCustomerTokenNew: 'NA',
                        totalDays: String(data.numberOfDays),
                        tripamount: String(data.tripAmount),
                        userId: String(data.userId),
                    };
                    const keysToRemove = [
                        'image',
                        'name',
                        'type',
                        'authAmount',
                        'authPercentage',
                        'hostPriceMap',
                        'numberOfDays',
                        'price',
                        'pricePerDay',
                        'totalAmount',
                        'tripAmount',
                        'upcharges',
                        'stateSurchargeAmount',
                        'stateSurchargeTax',
                        'hostid',
                        'delivery',
                    ];
                    keysToRemove?.forEach(key => {
                        if (payload.hasOwnProperty(key)) {
                            delete payload[key];
                        }
                    });
                    console.log('Reservation payload', payload);
                    const response:any = await createTripReservation(payload);
                    console.log(response);

                    if (response && response.success) {
                        setPayment({ status: 'succeeded' });
                        secureLocalStorage.removeItem('checkOutInfo');
                        setTimeout(() => {
                            window.location.href = '/checkout/success';
                        }, 1200);
                    } else {
                        setPayment({ status: 'error' });
                        const errorMessage = response && response.message ? response.message : 'Unknown error occurred.';
                        setErrorMessage('Payment failed. Please try again. ' + errorMessage);
                        secureLocalStorage.removeItem('checkOutInfo');
                        setTimeout(() => {
                            window.location.href = '/checkout/failure';
                        }, 2500);
                    }
                } else {
                    console.log(error);
                    setPayment({ status: 'error' });
                    setErrorMessage('Payment failed. Please try again.');
                }
            } else {
                console.log(error);
                const { message } = error as StripeError;

                setPayment({ status: 'error' });
                setErrorMessage(message ?? 'An unknown error occurred');
            }
        } catch (err) {
            const { message } = err as StripeError;

            setPayment({ status: 'error' });
            setErrorMessage(message ?? 'An unknown error occurred');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                <div className=''>
                    <PaymentElement />
                </div>
                <PaymentStatus status={payment.status} errorMessage={errorMessage} />
                <Button
                    variant={payment.status === 'succeeded' ? 'success' : 'black'}
                    className='mt-1 h-10 w-full'
                    type='submit'
                    disabled={!['initial', 'error'].includes(payment.status) || !stripe || payment.status === 'succeeded'}
                    loadingText='Processing...'
                    loading={['processing', 'requires_payment_method', 'requires_confirmation'].includes(payment.status)}>
                    {payment.status === 'succeeded' ? (
                        <span className='flex items-center gap-2'>
                            <FaRegCheckCircle className='' /> Transaction Completed
                        </span>
                    ) : (
                        <span>Pay Now</span>
                    )}
                </Button>
            </form>
        </>
    );
}

const PaymentStatus = ({ status, errorMessage }: { status: string; errorMessage?: string }) => {
    switch (status) {
        case 'requires_action':
            return <h4>Authenticating...</h4>;

        case 'error':
            return (
                <div className='my-3 select-none rounded-md bg-red-50 p-3'>
                    <div className='flex'>
                        <div className='flex-shrink-0'>
                            <IoWarning className='h-5 w-5 text-red-400' />
                        </div>
                        <div className='ml-3'>
                            <p className='text-sm font-medium text-red-800'>{errorMessage}</p>
                        </div>
                    </div>
                </div>
            );

        default:
            return null;
    }
};
