'use client';

import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody } from '@/components/ui/dialog';
import useCardChangeDialog from '@/hooks/dialogHooks/useCardChangeDialog';
import getStripe from '@/lib/get-stripejs';
import { CardChangeIcon } from '@/public/icons';
import { createSetUpIntent } from '@/server/checkout';
import { changeCardForTrip } from '@/server/tripOperations';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeError } from '@stripe/stripe-js';
import { AlertCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CardChangeDialogProps {
    tripId: number;
}

export default function CardChangeDialog({ tripId }: CardChangeDialogProps) {
    const cardChangeDialog = useCardChangeDialog();
    const [loadingStripeElements, setLoadingStripeElememts] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [customerId, setCustomerId] = useState('');

    const initializePayment = async () => {
        setLoadingStripeElememts(true);
        try {
            const { client_secret, customerId } = await createSetUpIntent();
            setClientSecret(client_secret);
            setCustomerId(customerId);
        } catch (error) {
            console.error('Error initializing payment:', error);
        } finally {
            setLoadingStripeElememts(false);
        }
    };

    const openModal = () => {
        initializePayment();
        cardChangeDialog.onOpen();
    };

    const closeModal = () => {
        setClientSecret('');
        setCustomerId('');
        setLoadingStripeElememts(false);
        cardChangeDialog.onClose();
    };

    return (
        <>
            <Button onClick={openModal} variant='link' className='flex items-center gap-2 p-0 font-semibold text-foreground' size='lg'>
                <CardChangeIcon className='size-6' />
                Change Card
            </Button>

            {cardChangeDialog.isOpen && (
                <Dialog
                    isOpen={cardChangeDialog.isOpen}
                    closeDialog={closeModal}
                    openDialog={openModal}
                    className='md:max-w-3xl'
                    title='Change Card'
                    onInteractOutside={false}
                    description='Please enter your new Card details to initiate the change.'>
                    <DialogBody className='overflow-x-hidden'>
                        {loadingStripeElements && <CheckoutCardSkeleton className='lg:w-full' />}
                        {!loadingStripeElements && clientSecret && (
                            <Elements
                                stripe={getStripe()}
                                options={{
                                    clientSecret,
                                    appearance: {
                                        variables: {
                                            colorIcon: '#de6400',
                                            fontFamily: 'Inter, Roboto, Open Sans, Segoe UI, sans-serif'
                                        }
                                    }
                                }}>
                                <CardChangeFormSubmit customerId={customerId} tripId={tripId} closeModal={closeModal} />
                            </Elements>
                        )}
                    </DialogBody>
                </Dialog>
            )}
        </>
    );
}

interface CardChangeFormSubmitProps {
    customerId: string;
    tripId: number;
    closeModal: () => void;
}

function CardChangeFormSubmit({ customerId, tripId, closeModal }: CardChangeFormSubmitProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [payment, setPayment] = useState<{
        status: 'initial' | 'processing' | 'error' | 'succeeded';
    }>({ status: 'initial' });

    async function handleSubmit(e: { preventDefault: () => void; currentTarget: { reportValidity: () => any } }) {
        try {
            setLoading(true);
            e.preventDefault();
            // Abort if form isn't valid
            if (!e.currentTarget.reportValidity()) return;
            if (!elements || !stripe) return;

            setPayment({ status: 'processing' });

            const paymentRes = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: 'https://www.mybundee.com/'
                },
                redirect: 'if_required'
            });

            const { setupIntent, error } = paymentRes;

            if (setupIntent) {
                const { payment_method } = setupIntent;

                const changeResponse = await changeCardForTrip(tripId, payment_method as string);

                if (changeResponse.success) {
                    setPayment({ status: 'succeeded' });
                    closeModal();
                    toast.success('Card changed successfully');
                    window.location.reload();
                } else {
                    setPayment({ status: 'error' });
                    setErrorMessage(changeResponse.message ?? 'An unknown error occurred');
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
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            <PaymentElement />
            <Status status={payment.status} errorMessage={errorMessage} />
            <div className='flex justify-end gap-6'>
                <Button type='button' variant='outline' onClick={closeModal} className='w-full sm:w-auto'>
                    Keep Current & Close
                </Button>
                <Button className='w-full sm:w-auto' variant='black' loadingText='Saving...' loading={loading} onClick={handleSubmit}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

function Status({ status, errorMessage }: { status: string; errorMessage?: string }) {
    switch (status) {
        case 'requires_action':
            return <h4>Authenticating...</h4>;

        case 'error':
            return (
                <div className='my-3 flex select-none items-center gap-4 rounded-md bg-red-50 p-3'>
                    <AlertCircleIcon className='h-5 w-5 text-red-400' />
                    <p className='font-medium text-red-600 text-sm'>{errorMessage}</p>
                </div>
            );

        default:
            return null;
    }
}
