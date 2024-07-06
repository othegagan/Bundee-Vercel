'use client';

import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import getStripe from '@/lib/get-stripejs';
import { createSetUpIntent } from '@/server/checkout';
import { Elements } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import CheckoutForm from './CheckoutForm';

const StripePaymentComponent = () => {
    const [clientSecret, setClientSecret] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializePayment = async () => {
            try {
                const { client_secret, customerId } = await createSetUpIntent();
                setClientSecret(client_secret);
                setCustomerId(customerId);
            } catch (error) {
                console.error('Error initializing payment:', error);
            } finally {
                setLoading(false);
            }
        };

        initializePayment();
    }, []);

    if (loading) {
        return <CheckoutCardSkeleton />;
    }

    return (
        <div>
            {clientSecret && (
                <Elements
                    stripe={getStripe()}
                    options={{
                        clientSecret,
                        appearance: {
                            variables: {
                                colorIcon: '#de6400',
                                fontFamily: 'Inter, Roboto, Open Sans, Segoe UI, sans-serif',
                            },
                        },
                    }}>
                    <CheckoutForm customerId={customerId} />
                </Elements>
            )}
        </div>
    );
};

export default StripePaymentComponent;
