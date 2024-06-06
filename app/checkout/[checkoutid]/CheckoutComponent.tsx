'use client';
import BoxContainer from '@/components/BoxContainer';
import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatDateAndTime } from '@/lib/utils';
import { createSetUpIntent, createTripReservation } from '@/server/checkout';
import { useEffect, useState } from 'react';
import { IoWarning } from 'react-icons/io5';
import { LuLoader2 } from 'react-icons/lu';
import secureLocalStorage from 'react-secure-storage';

declare const Stripe: any;
declare var elements: any;
declare var stripe: any;

export default function CheckoutComponent() {
    const [elementFetched, setElementFetched] = useState(false);
    const [checkoutDetails, setCheckoutDetails] = useState<any>({});
    const [userRequestType, setUserRequestType] = useState('');
    const [payButtonText, setPayButtonText] = useState('Pay Now');
    const [vehicleImage, setVehicleImage] = useState('');
    const [vehicleName, setVehicleName] = useState('');
    const [message, setMessage] = useState('');
    const [customerId, setCustomerId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = JSON.parse(secureLocalStorage.getItem('checkOutInfo') as any);
                if (!data) {
                    window.location.href = '/';
                    return;
                }
                setCheckoutDetails(data);
                setUserRequestType(data.type);
                setVehicleName(data.name);
                setVehicleImage(data.image);
                createIntent();
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const createIntent = async () => {
        setMessage('');
        setPayButtonText('Pay Now');
        try {
            const createIntentResponse = await createSetUpIntent();
            if (!createIntentResponse) throw new Error('Failed to create setup intent.');
            const responseData: any = createIntentResponse.setupIntent;
            const id = responseData.customer;
            setCustomerId(id);
            initializeStripe(responseData.client_secret);
        } catch (error) {
            toast({ duration: 4000, variant: 'success', title: ' Oops! Something went wrong.', description: 'Something went wrong in initializing payment.' });
            secureLocalStorage.removeItem('checkOutInfo');
            window.location.href = '/checkout/success';
            console.error(error);
        }
    };

    const initializeStripe = clientSecret => {
        stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        elements = stripe.elements({ clientSecret: clientSecret });
        const paymentElementOptions = { layout: 'tabs' };
        const paymentElement = elements.create('payment', paymentElementOptions);
        paymentElement.mount('#payment-element');
        setElementFetched(true);
    };

    const submit = async () => {
        setMessage('');
        setPayButtonText('Processing Payment');

        try {
            const paymentRes = await stripe.confirmSetup({
                elements,
                confirmParams: { return_url: window.location.origin + '/trips' },
                redirect: 'if_required',
            });

            const { setupIntent, error } = paymentRes;

            if (setupIntent) {
                const { id: setUpId, status, payment_method } = setupIntent;

                if (status === 'succeeded') {
                    // console.log(setUpId, status, payment_method);
                    // Payment setup succeeded, handle success
                    await createReservation(payment_method);
                }
            } else {
                console.log(error);
                let errorMessage = 'Payment failed. Please try again.';
                if (error) {
                    const errorCode = error.code;
                    const declineCode = error.decline_code;

                    switch (errorCode) {
                        case 'insufficient_funds':
                            errorMessage = 'You have insufficient funds. Please use another payment method or ensure sufficient funds.';
                            break;
                        case 'expired_card':
                            errorMessage = 'Your card has expired. Please use a different card.';
                            break;
                        case 'incorrect_cvc':
                            errorMessage = 'The CVC code is incorrect. Please try again.';
                            break;
                        case 'card_declined':
                            errorMessage = `Your card was declined. Reason: ${declineCode || 'generic decline'}. Please try another card or contact your bank.`;
                            break;
                        default:
                            errorMessage = error.message || errorMessage;
                            break;
                    }
                }
                setMessage(errorMessage);
                setPayButtonText('Pay Now');
                // handleError('Oops! Your payment is not successful.', 'Payment setup did not succeed.');
            }
        } catch (error) {
            setPayButtonText('Pay Now');
            console.error('Error processing payment', error);
            toast({ duration: 4000, variant: 'destructive', title: 'Oops! Your payment is not successful.', description: 'Payment failed.' });
            window.location.href = '/checkout/failure';
        }
    };

    const createReservation = async (payment_method: string) => {
        try {
            const payload = {
                ...checkoutDetails,
                stripePaymentToken: 'NA',
                customerToken: customerId,
                stripePaymentTransactionDetail: '{ "key1" : "val1" }',
                stripePaymentID: 'NA',
                paymentMethodIDToken: payment_method,
                setupIntentToken: 'NA',
                isCustomerTokenNew: 'NA',
                totalDays: String(checkoutDetails.numberOfDays),
                tripamount: String(checkoutDetails.tripAmount),
                userId: String(checkoutDetails.userId),
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

            const response = await createTripReservation(payload);
            console.log(response);

            toast({ duration: 4000, variant: 'success', title: 'Payment made successful.', description: 'Your transaction was successful.' });
            secureLocalStorage.removeItem('checkOutInfo');
            window.location.href = '/checkout/success';
        } catch (error) {
            console.error('Error creating reservation:', error);
            toast({ duration: 4000, variant: 'destructive', title: 'Oops! Your payment is not successful.', description: 'Payment failed.' });
            window.location.href = '/checkout/failure';
        }
    };

    return (
        <>
            <script src='https://js.stripe.com/v3/'></script>
            <script src='/stripeDetails.js'></script>

            <BoxContainer className='py-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16'>
                    <div className='col-span-1'>
                        {userRequestType === 'reservation' && (
                            <div className='mt-10 lg:mt-0'>
                                <TripDetail vehicleImage={vehicleImage} vehicleName={vehicleName} checkoutDetails={checkoutDetails} />
                            </div>
                        )}

                        {(userRequestType === 'modify' || userRequestType === 'reduction') && (
                            <div className='mt-6 lg:mt-0'>
                                <TripDetail vehicleImage={vehicleImage} vehicleName={vehicleName} checkoutDetails={checkoutDetails} />
                            </div>
                        )}
                    </div>

                    <PaymentSection elementFetched={elementFetched} payButtonText={payButtonText} submit={submit} message={message} />
                </div>
            </BoxContainer>
        </>
    );
}

function TripDetail({ vehicleImage, vehicleName, checkoutDetails }) {
    return (
        <div className='mt-4 min-h-10 rounded-lg border border-gray-200 bg-white shadow-sm'>
            <div className='flex px-4 py-6 sm:px-6'>
                <div className='rounded-lg sm:overflow-hidden'>
                    <img src={vehicleImage} className='max-h-fit min-w-full' alt='Vehicle' />
                </div>
            </div>

            <dl className='space-y-3 border-t border-gray-200 px-4 py-6 sm:px-6'>
                <h5 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{vehicleName}</h5>
                <div className='flex items-center justify-between'>
                    <dt className='text-sm font-bold'>Trip Start Date</dt>
                    <dd className='text-sm font-medium text-gray-900'>{formatDateAndTime(checkoutDetails.startTime, checkoutDetails.zipCode)}</dd>
                </div>
                <div className='flex items-center justify-between'>
                    <dt className='text-sm font-bold'>Trip End Date</dt>
                    <dd className='text-sm font-medium text-gray-900'>{formatDateAndTime(checkoutDetails.endTime, checkoutDetails.zipCode)}</dd>
                </div>
            </dl>

            <dl className='space-y-3 border-t border-gray-200 px-4 py-6 sm:px-6'>
                <div className='flex items-center justify-between'>
                    <dt className='text-sm'>Trip Duration</dt>
                    <dd className='text-sm font-medium text-gray-900'>
                        {checkoutDetails.totalDays} {checkoutDetails.totalDays === 1 ? 'Day' : 'Days'}
                    </dd>
                </div>
                <div className='flex items-center justify-between'>
                    <dt className='text-sm'>Trip Amount</dt>
                    <dd className='text-sm font-medium text-gray-900'>${checkoutDetails.tripamount.toFixed(2)}</dd>
                </div>
                <div className='flex items-center justify-between'>
                    <dt className='text-sm'>Taxes</dt>
                    <dd className='text-sm font-medium text-gray-900'>${checkoutDetails.taxAmount.toFixed(2)}</dd>
                </div>
                <div className='flex items-center justify-between border-t border-gray-200 pt-6'>
                    <dt className='text-base font-medium'>Total Amount</dt>
                    <dd className='text-lg font-bold text-gray-900'> ${checkoutDetails.tripTaxAmount.toFixed(2)}</dd>
                </div>
            </dl>
        </div>
    );
}

function PaymentSection({ elementFetched, payButtonText, submit, message }) {
    return (
        <div className='col-span-1 flex flex-col gap-2 pt-5'>
            <div className='rounded-sm bg-white p-4 shadow-md' id='payment-element'></div>
            <div className='border-t border-gray-200 px-4 py-6 sm:px-6'>
                {message && (
                    <div className='my-3 select-none rounded-md bg-red-50 p-3'>
                        <div className='flex'>
                            <div className='flex-shrink-0'>
                                <IoWarning className='h-5 w-5 text-red-400' />
                            </div>
                            <div className='ml-3'>
                                <p className='text-sm font-medium text-red-800'>{message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {elementFetched ? (
                    <Button
                        size='lg'
                        variant='black'
                        className='flex h-12 w-full items-center gap-4'
                        onClick={submit}
                        disabled={payButtonText === 'Processing Payment'}>
                        {payButtonText === 'Processing Payment' ? <LuLoader2 className='h-6 w-6 animate-spin text-white' /> : null} {payButtonText}
                    </Button>
                ) : (
                    <CheckoutCardSkeleton />
                )}
            </div>
        </div>
    );
}
