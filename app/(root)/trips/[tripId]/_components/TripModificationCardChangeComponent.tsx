import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useTripModification from '@/hooks/useTripModification';
import getStripe from '@/lib/get-stripejs';
import { createSetUpIntent } from '@/server/checkout';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeError } from '@stripe/stripe-js';
import { AlertCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TripModificationCardChangeProps {
    tripId: number;
    type: 'extension' | 'reduction';
    closeModifyDialog: () => void;
    vehzipcode: string;
    newStartDate: string;
    newEndDate: string;
    newStartTime: string;
    newEndTime: string;
    priceCalculatedList: any;
    priceLoading: boolean;
    dateSelectionError: any;
    priceError: any;
    cardOption?: boolean;
}

export default function TripModificationCardChangeComponent({
    tripId,
    closeModifyDialog,
    vehzipcode,
    newStartDate,
    newEndDate,
    newStartTime,
    newEndTime,
    priceCalculatedList,
    priceLoading,
    dateSelectionError,
    priceError,
    type
}: TripModificationCardChangeProps) {
    const [loadingStripeElements, setLoadingStripeElememts] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    const [cardOption, setCardOption] = useState('current');

    const initializePayment = async () => {
        setClientSecret('');
        setLoadingStripeElememts(true);
        try {
            const { client_secret, customerId } = await createSetUpIntent();
            setClientSecret(client_secret);
        } catch (error) {
            console.error('Error initializing payment:', error);
        } finally {
            setLoadingStripeElememts(false);
        }
    };

    useEffect(() => {
        if (cardOption === 'change' && !clientSecret) initializePayment();
    }, [cardOption]);

    if (!priceError && priceCalculatedList && !dateSelectionError)
        return (
            <>
                <RadioGroup value={cardOption} onValueChange={setCardOption} className='mb-6 space-y-4'>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='current' id='current' />
                        <Label htmlFor='current' className='font-medium'>
                            Continue with current Card
                            <p className='font-normal text-muted-foreground text-sm'>Use the same card as your previous payment.</p>
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='change' id='change' />
                        <Label htmlFor='change' className='font-medium'>
                            Change Card
                            <p className='font-normal text-muted-foreground text-sm'>Enter a new credit card for this modification.</p>
                        </Label>
                    </div>
                </RadioGroup>

                {cardOption === 'change' ? (
                    <>
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
                                <TripModificationSubmitWithCardComponent
                                    type={type}
                                    closeModifyDialog={closeModifyDialog}
                                    tripId={tripId}
                                    newEndDate={newEndDate}
                                    newStartDate={newStartDate}
                                    newStartTime={newStartTime}
                                    newEndTime={newEndTime}
                                    vehzipcode={vehzipcode}
                                    priceCalculatedList={priceCalculatedList}
                                    priceLoading={priceLoading}
                                    dateSelectionError={dateSelectionError}
                                    priceError={priceError}
                                />
                            </Elements>
                        )}
                    </>
                ) : (
                    <TripModificationSubmitWithoutCardComponent
                        type={type}
                        closeModifyDialog={closeModifyDialog}
                        tripId={tripId}
                        newEndDate={newEndDate}
                        newStartDate={newStartDate}
                        newStartTime={newStartTime}
                        newEndTime={newEndTime}
                        vehzipcode={vehzipcode}
                        priceCalculatedList={priceCalculatedList}
                        priceLoading={priceLoading}
                        dateSelectionError={dateSelectionError}
                        priceError={priceError}
                    />
                )}
            </>
        );
}

function TripModificationSubmitWithCardComponent({
    tripId,
    type,
    closeModifyDialog,
    priceCalculatedList,
    priceLoading,
    dateSelectionError,
    priceError,
    newStartDate,
    newEndDate,
    newStartTime,
    newEndTime,
    vehzipcode
}: TripModificationCardChangeProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [payment, setPayment] = useState<{
        status: 'initial' | 'processing' | 'error' | 'succeeded';
    }>({ status: 'initial' });

    const { submitting, handleTripModification } = useTripModification();

    async function handleSubmit(e: { preventDefault: () => void; currentTarget: { reportValidity: () => any } }) {
        try {
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

                handleTripModification({
                    type,
                    tripid: tripId,
                    vehzipcode,
                    newStartDate,
                    newEndDate,
                    newStartTime,
                    newEndTime,
                    paymentMethod: payment_method as string
                });
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
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='max-w-xl p-2'>
                <PaymentElement
                    options={{
                        layout: {
                            type: 'tabs',
                            defaultCollapsed: false
                        },
                        fields: {
                            billingDetails: 'auto'
                        }
                    }}
                />
            </div>
            <Status status={payment.status} errorMessage={errorMessage} />
            <div className='mt-auto flex items-center justify-end gap-4'>
                <Button type='button' onClick={closeModifyDialog} variant='outline'>
                    Keep Current & Close
                </Button>
                <Button
                    type='button'
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={priceLoading || !priceCalculatedList || Boolean(priceError) || submitting}
                    className={`bg-primary ${dateSelectionError || priceLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

function TripModificationSubmitWithoutCardComponent({
    tripId,
    type,
    closeModifyDialog,
    priceCalculatedList,
    priceLoading,
    dateSelectionError,
    priceError,
    newStartDate,
    newEndDate,
    newStartTime,
    newEndTime,
    vehzipcode
}: TripModificationCardChangeProps) {
    const { submitting, handleTripModification } = useTripModification();

    function handleSubmit() {
        handleTripModification({
            type,
            tripid: tripId,
            vehzipcode,
            newStartDate,
            newEndDate,
            newStartTime,
            newEndTime,
            paymentMethod: null
        });
    }

    return (
        <div className='mt-auto flex items-center justify-end gap-4'>
            <Button type='button' onClick={closeModifyDialog} variant='outline'>
                Keep Current & Close
            </Button>
            <Button
                type='button'
                onClick={handleSubmit}
                loading={submitting}
                disabled={priceLoading || !priceCalculatedList || Boolean(priceError) || submitting}
                className={`bg-primary ${dateSelectionError || priceLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                Save Changes
            </Button>
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
