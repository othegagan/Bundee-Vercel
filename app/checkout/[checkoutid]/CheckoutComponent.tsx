'use client';
import BoxContainer from '@/components/BoxContainer';
import { CheckoutCardSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getSession } from '@/lib/auth';
import { formatDateAndTime } from '@/lib/utils';
import { cancelPaymentIntent, createPaymentIntentWithAmount, createTripExtension, createTripReduction, createTripReservation } from '@/server/checkout';
import { useEffect, useState } from 'react';
import { LuLoader2 } from 'react-icons/lu';
import secureLocalStorage from 'react-secure-storage';

declare const Stripe: any;
declare var elements: any;
declare var stripe: any;

export default function CheckoutComponent() {
    const [elementFetched, setElementFetched] = useState(false);
    const [checkoutDetails, setCheckoutDetails] = useState<any>({});
    const [userRequestType, setUserRequestType] = useState('');
    const [payButtonText, setPayButtonText] = useState('Continue to Payment');
    const [vehicleImage, setVehicleImage] = useState('');
    const [vehicleName, setVehicleName] = useState('');

    const [params, setParams] = useState<any>({
        id: '',
        startDate: '',
        endDate: '',
        pickupTime: '',
        dropTime: '',
        pricePerHour: '',
    });

    useEffect(() => {
        try {
            const data = JSON.parse(secureLocalStorage.getItem('checkOutInfo') as any);

            const fetchVehicleMetaData = () => {
                setCheckoutDetails(data);

                setUserRequestType(data.type);
                console.log(data.type);

                setVehicleName(data.name);
                setVehicleImage(data.image);

                if (data) {
                    createIntent();
                } else {
                    window.location.href = '/';
                }
            };

            fetchVehicleMetaData();
        } catch (error) {
            console.log(error);
        }
    }, []);

    const createIntent = async () => {
        const checkoutData = JSON.parse(secureLocalStorage.getItem('checkOutInfo') as any);
        const createIntentResponse = await createPaymentIntentWithAmount(Number(checkoutData.totalamount));
        try {
            if (createIntentResponse.success) {
                const responseData = createIntentResponse.data.response;
                setParams(responseData);

                const clientSecret = responseData.client_secret;

                stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
                elements = stripe.elements({ clientSecret: clientSecret });
                const paymentElementOptions = {
                    layout: 'tabs',
                };
                // console.log(stripe, elements);
                const paymentElement = elements.create('payment', paymentElementOptions);
                paymentElement.mount('#payment-element');
                setElementFetched(true);
            } else {
                throw new Error(createIntentResponse.message);
            }
        } catch (error) {
            console.log(error);
            setElementFetched(false);
            toast({
                duration: 3000,
                variant: 'destructive',
                title: 'Oops! Something went wrong.',
                description: 'Something went wrong in initializing payment.',
            });
        }
    };

    const submit = async () => {
        setPayButtonText('Processing Payment');
        try {
            const session = await getSession();
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/trips',
                    receipt_email: session.email,
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error(error);
                // handleError();
                setPayButtonText('Continue to Payment');
            } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
                console.log('Payment succeeded');
                handleSuccess();
            } else {
                console.log('Payment failed', error);
                setPayButtonText('Continue to Payment');
            }
        } catch (e) {
            console.error('Error processing payment', e);
            // handleError();
            setPayButtonText('Continue to Payment');
        }
    };

    const createReservation = async () => {
        try {
            const payload = {
                ...checkoutDetails,
                stripePaymentToken: params.stripePaymentToken,
                customerToken: params.customerToken,
                stripePaymentTransactionDetail: '{ "key1" : "val1" }',
                stripePaymentID: 'NA',
                paymentMethodIDToken: 'NA',
                setupIntentToken: 'NA',
                isCustomerTokenNew: 'NA',
                totalDays: String(checkoutDetails.numberOfDays),
                tripamount: String(checkoutDetails.tripAmount),
            };

            delete payload.image;
            delete payload.name;
            delete payload.type;
            delete payload.authAmount;
            delete payload.authPercentage;
            delete payload.hostPriceMap;
            delete payload.numberOfDays;
            delete payload.price;
            delete payload.pricePerDay;
            delete payload.totalAmount;
            delete payload.tripAmount;
            delete payload.upcharges;
            delete payload.stateSurchargeAmount;
            delete payload.stateSurchargeTax;

            console.log(' reservation payload', payload);

            const response = await createTripReservation(payload);
            console.log(response);

            if (response.success) {
                toast({
                    duration: 3000,
                    variant: 'success',
                    title: 'Payment made successful.',
                    description: 'Thank you for your payment. Your transaction was successful.',
                });
                secureLocalStorage.removeItem('checkOutInfo');
                window.location.href = '/checkout/success';
            } else {
                handleError();
                console.log('error in back end api', response.data);
                secureLocalStorage.removeItem('checkOutInfo');
                window.location.href = '/checkout/failure';
            }
        } catch (error) {
            handleError();
            secureLocalStorage.removeItem('checkOutInfo');
            console.error('Error creating reservation:', error);
        }
    };

    const tripExtension = async () => {
        const payload = {
            ...checkoutDetails,
            stripePaymentToken: params.stripePaymentToken,
            customerToken: params.customerToken,
            stripePaymentID: 'NA',
            stripePaymentTransactionDetail: '{ "key1" : "val1" }',
            paymentMethodIDToken: 'NA',
            setupIntentToken: 'NA',
            delivery: false,
            totalDays: String(checkoutDetails.totalDays),
            tripamount: String(checkoutDetails.tripamount),
            userId: String(checkoutDetails.userId),
        };

        delete payload.image;
        delete payload.name;
        delete payload.type;
        delete payload.authAmount;
        delete payload.authPercentage;
        delete payload.hostPriceMap;
        delete payload.numberOfDays;
        delete payload.price;
        delete payload.pricePerDay;
        delete payload.totalAmount;
        delete payload.tripAmount;
        delete payload.upcharges;
        delete payload.hostid;
        delete payload.stateSurchargeAmount;
        delete payload.stateSurchargeTax;
        delete payload.delivery;

        // console.log('Trip Extension payload', payload);

        try {
            const response = await createTripExtension(payload);
            // console.log(response)

            if (response.success) {
                toast({
                    duration: 3000,
                    variant: 'success',
                    title: 'Payment made successful.',
                    description: 'Thank you for your payment. Your transaction was successful.',
                });
                localStorage.removeItem('checkOutInfo');
                window.location.href = '/checkout/success';
            } else {
                localStorage.removeItem('checkOutInfo');
                handleError();
                window.location.href = '/checkout/failure';
            }
        } catch (error) {
            localStorage.removeItem('checkOutInfo');
            handleError();
            console.error('Error modification of trip:', error);
        }
    };

    const tripReduction = async () => {
        const payload = {
            ...checkoutDetails,
            stripePaymentToken: params.stripePaymentToken,
            customerToken: params.customerToken,
            stripePaymentID: 'NA',
            stripePaymentTransactionDetail: '{ "key1" : "val1" }',
            paymentMethodIDToken: 'NA',
            setupIntentToken: 'NA',
            delivery: false,
            totalDays: String(checkoutDetails.totalDays),
            tripamount: String(checkoutDetails.tripamount),
            userId: String(checkoutDetails.userId),
        };

        delete payload.image;
        delete payload.name;
        delete payload.type;
        delete payload.authAmount;
        delete payload.authPercentage;
        delete payload.hostPriceMap;
        delete payload.numberOfDays;
        delete payload.price;
        delete payload.pricePerDay;
        delete payload.totalAmount;
        delete payload.tripAmount;
        delete payload.upcharges;
        delete payload.hostid;
        delete payload.stateSurchargeAmount;
        delete payload.stateSurchargeTax;
        delete payload.delivery;

        // console.log('Trip reduction payload', payload);

        try {
            const response = await createTripReduction(payload);

            if (response.success) {
                toast({
                    duration: 3000,
                    variant: 'success',
                    title: 'Payment made successful.',
                    description: 'Thank you for your payment. Trip reduction was successful.',
                });
                localStorage.removeItem('checkOutInfo');
                window.location.href = '/checkout/success';
            } else {
                localStorage.removeItem('checkOutInfo');
                handleError();
                window.location.href = '/checkout/failure';
            }
        } catch (error) {
            localStorage.removeItem('checkOutInfo');
            handleError();
            console.error('Error reduction of trip:', error);
        }
    };

    const cancelIntent = async () => {
        let vehicleid = checkoutDetails.vehicleId;
        let amount = checkoutDetails.totalamount;
        let hostid = checkoutDetails.hostid;
        let stripetoken = params.stripePaymentToken;
        let stripetokenid = params.customerToken;

        const response = await cancelPaymentIntent(vehicleid, amount, hostid, stripetoken, stripetokenid);
    };

    const handleSuccess = async () => {
        // console.log(userRequestType);
        if (userRequestType == 'reservation') {
            createReservation();
        }

        if (userRequestType == 'modify') {
            tripExtension();
        }

        if (userRequestType == 'reduction') {
            tripReduction();
        }
    };

    const handleError = () => {
        cancelIntent();
        toast({
            duration: 3000,
            variant: 'destructive',
            title: 'Oops! Your payment is not successful.',
            description: 'Please check your payment details and try again.',
        });
        window.location.href = '/checkout/failure';
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

                    <PaymentSection elementFetched={elementFetched} payButtonText={payButtonText} submit={submit} />
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

function PaymentSection({ elementFetched, payButtonText, submit }) {
    return (
        <div className='col-span-1 flex flex-col gap-2 pt-5'>
            <div className='rounded-sm bg-white p-4 shadow-md' id='payment-element'></div>
            <div className='border-t border-gray-200 px-4 py-6 sm:px-6'>
                {elementFetched ? (
                    <Button size='lg' className='flex h-12 w-full items-center gap-4' onClick={submit} disabled={payButtonText === 'Processing Payment'}>
                        {payButtonText === 'Processing Payment' ? <LuLoader2 className='h-6 w-6 animate-spin text-white' /> : null} {payButtonText}
                    </Button>
                ) : (
                    <CheckoutCardSkeleton />
                )}
            </div>
        </div>
    );
}
