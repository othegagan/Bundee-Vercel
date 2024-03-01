'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { extractTimeIn12HourFormat } from '@/lib/createDateTime';
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';

declare const Stripe: any;
declare var elements: any;
declare var stripe: any;

export default function SingleVehicleDetails() {
    const createPaymentInent = process.env.NEXT_PUBLIC_BUNDEE_CREATE_PAYMENT_INTENT_WITH_AMOUNT_CHECKOUT;
    const reservationURL = process.env.NEXT_PUBLIC_BUNDEE_RESERVATION_URL_CHECKOUT;
    const tripModificationURL = process.env.NEXT_PUBLIC_BUNDEE_TRIP_MODIFICATION_URL_CHECKOUT;
    const cancelPaymentIntentURL = process.env.NEXT_PUBLIC_BUNDEE_CANCEL_PAYMENT_INTENT_URL;

    const [vehicleImage, setVehicleImage] = useState('');
    const [vehicleName, setVehicleName] = useState('');
    const [elementFetched, setElementFetched] = useState(false);
    const [paybuttontext, setPaybuttonText] = useState('Continue to Payment');
    const [checkoutDetails, setCheckoutDetails] = useState<any>({});

    const [isuser, setIsUser] = useState(false);
    const [userRequestType, setUserRequestType] = useState('');

    const hasEffectRun = useRef(false);

    const [params, setParams] = useState<any>({
        id: '',
        startDate: '',
        endDate: '',
        pickupTime: '',
        dropTime: '',
        pricePerHour: '',
    });

    useEffect(() => {
        const id = localStorage.getItem('userId');
        //@ts-ignore
        const data = JSON.parse(secureLocalStorage.getItem('checkOutInfo'));

        const fetchVehicleMetaData = () => {
            setCheckoutDetails(data);

            setUserRequestType(data.type);
            console.log(data.type);

            setVehicleName(data.name);
            setVehicleImage(data.image);
        };

        if (!hasEffectRun.current && id) {
            setIsUser(true);
            fetchVehicleMetaData();

            createIntent();
            hasEffectRun.current = true;
        } else if (!id) {
            window.location.href = '/noauth/not-authenticated';
        }
    }, []);

    const createIntent = async () => {
        var data = JSON.parse(secureLocalStorage.getItem('checkOutInfo') as any);
        const bundeeToken = localStorage.getItem('auth_token_login');

        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('bundee_auth_token', bundeeToken);

        var raw = JSON.stringify({
            email: localStorage.getItem('session_user'),
            amount: Number(parseInt(data.totalamount)),
            password: '535dff60664c8a624e056fb739e41e623b906daf3a59840f03613bbec19b6eb3',
        });

        // console.log('Payment INtent Payload ', raw);

        fetch(createPaymentInent, {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        })
            .then(response => response.json())
            .then(async result => {
                // console.log(result);
                setParams(result.response);

                const clientSecret = result.response.client_secret;

                stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
                elements = stripe.elements({ clientSecret: clientSecret });
                const paymentElementOptions = {
                    layout: 'tabs',
                };
                // console.log(stripe, elements);
                const paymentElement = elements.create('payment', paymentElementOptions);
                paymentElement.mount('#payment-element');
                setElementFetched(true);
            })

            .catch(error => {
                console.log('error', error);

                toast({
                    duration: 3000,
                    className: 'bg-red-400 text-white',
                    title: 'Oops! Something went wrong.',
                    description: 'Please check your payment details and try again.',
                });
                setElementFetched(false);
            });
    };

    const submit = async () => {
        setPaybuttonText('Processing Payment');
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/trips',
                    receipt_email: localStorage.getItem('session_user'),
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error(error);
                // handleError();
                setPaybuttonText('Continue to Payment');
            } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
                console.log('Payment succeeded');
                handleSuccess();
            } else {
                console.log('Payment failed', error);
                setPaybuttonText('Continue to Payment');
            }
        } catch (e) {
            console.error('Error processing payment', e);
            // handleError();
            setPaybuttonText('Continue to Payment');
        }
    };

    const handleError = () => {
        cancelPaymentIntent();
        toast({
            duration: 3000,
            className: 'bg-red-400 text-white',
            title: 'Oops! Your payment is not successful.',
            description: 'Please check your payment details and try again.',
        });
        window.location.href = '/checkout/failure';
    };

    const cancelPaymentIntent = async () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('auth_token_login');

        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('bundee_auth_token', token);

        const data = {
            userid: userId,
            vehicleid: checkoutDetails.vehicleId,
            amount: checkoutDetails.totalamount,
            hostid: checkoutDetails.hostid,
            stripetoken: params.stripePaymentToken,
            stripetokenid: params.customerToken,
            channelName: 'Bundee',
        };

        const payload = JSON.stringify(data);
        // console.log('payload for payement cancelation', payload);

        try {
            const response = await fetch(cancelPaymentIntentURL, {
                method: 'POST',
                headers: myHeaders,
                body: payload,
                redirect: 'follow',
            });

            const result = await response.json();

            // Check the result and redirect accordingly
            if (result.errorCode === '0') {
                // alert('payment canceled successfully ');
                // console.log('payment canceled ', result);
                // window.location.href = '/checkout/success';
            } else {
                // console.log('payment canceled ', result);
                // alert('Payment canceled  failed');
                // localStorage.removeItem('checkOutInfo');
                // window.location.href = '/checkout/failure';
            }
        } catch (error) {
            // localStorage.removeItem('checkOutInfo');
            // console.error('Error modification of trip:', error);
            // Handle error appropriately, e.g., cancel the payment intent or show an error message
            // alert('Payment canceled  failed');
        }
    };

    const handleSuccess = async () => {
        console.log(userRequestType);
        if (userRequestType == 'reservation') {
            createReservation();
        }

        if (userRequestType == 'modify') {
            tripModification();
        }
    };

    const createReservation = async () => {
        const bundeeToken = localStorage.getItem('auth_token_login');
        try {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json');
            myHeaders.append('bundee_auth_token', bundeeToken);

            const requestBody = {
                ...checkoutDetails,
                channelName: 'Bundee',
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

            delete requestBody.image;
            delete requestBody.name;
            delete requestBody.type;
            delete requestBody.authAmount;
            delete requestBody.authPercentage;
            delete requestBody.hostPriceMap;
            delete requestBody.numberOfDays;
            delete requestBody.price;
            delete requestBody.pricePerDay;
            delete requestBody.totalAmount;
            delete requestBody.tripAmount;
            delete requestBody.upcharges;

            const raw = JSON.stringify(requestBody);

            // console.log(' reservation payload', raw);

            const response = await fetch(reservationURL, {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow',
            });

            const result = await response.json();

            if (result.errorCode === '0') {
                toast({
                    duration: 3000,
                    className: 'bg-green-400 text-white',
                    title: 'Payment made successful.',
                    description: 'Thank you for your payment. Your transaction was successful.',
                });
                // console.log('sucess in back end api', result);
                secureLocalStorage.removeItem('checkOutInfo');
                window.location.href = '/checkout/success';
            } else {
                handleError();
                console.log('error in back end api', result);
                secureLocalStorage.removeItem('checkOutInfo');
                window.location.href = '/checkout/failure';
            }
        } catch (error) {
            handleError();
            secureLocalStorage.removeItem('checkOutInfo');
            console.error('Error creating reservation:', error);
        }
    };

    const tripModification = async () => {
        const token = localStorage.getItem('auth_token_login');

        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('bundee_auth_token', token);

        const requestBody = {
            ...checkoutDetails,
            stripePaymentToken: params.stripePaymentToken,
            customerToken: params.customerToken,
            stripePaymentID: 'NA',
            stripePaymentTransactionDetail: '{ "key1" : "val1" }',
            paymentMethodIDToken: 'NA',
            setupIntentToken: 'NA',
            isCustomerTokenNew: 'NA',
            delivery: false,
            totalDays: String(checkoutDetails.totalDays),
            tripamount: String(checkoutDetails.tripamount),
            userId: String(checkoutDetails.userId),
            channelName: 'Bundee',
            latitude: '',
            longitude: '',
            address1: '',
            address2: '',
            cityName: '',
            state: '',
            country: '',
            zipCode: '',
        };

        delete requestBody.image;
        delete requestBody.name;
        delete requestBody.type;
        delete requestBody.authAmount;
        delete requestBody.authPercentage;
        delete requestBody.hostPriceMap;
        delete requestBody.numberOfDays;
        delete requestBody.price;
        delete requestBody.pricePerDay;
        delete requestBody.totalAmount;
        delete requestBody.tripAmount;
        delete requestBody.upcharges;
        delete requestBody.hostid;

        const payload = JSON.stringify(requestBody);

        try {
            const response = await fetch(tripModificationURL, {
                method: 'POST',
                headers: myHeaders,
                body: payload,
                redirect: 'follow',
            });

            const result = await response.json();

            // Check the result and redirect accordingly
            if (result.errorCode === '0') {
                toast({
                    duration: 3000,
                    className: 'bg-green-400 text-white',
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
            // console.error('Error modification of trip:', error);
        }
    };

    const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-black/10 before:to-transparent`;

    return (
        <>
            <script src='https://js.stripe.com/v3/'></script>
            <script src='/stripeDetails.js'></script>

            {isuser && (
                <div>
                    <div className=''>
                        <div className='bg-white'>
                            <div className='mx-auto max-w-2xl px-4 pt-6 pb-24 sm:px-6 lg:max-w-7xl lg:px-8'>
                                <div className='lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16'>
                                    {userRequestType === 'reservation' && (
                                        <div className='mt-10 lg:mt-0'>
                                            <div className='mt-4 rounded-lg border border-gray-200 bg-white shadow-sm'>
                                                <div className='flex py-6 px-4 sm:px-6'>
                                                    <div className='sm:overflow-hidden rounded-lg '>
                                                        <div className='flex-shrink-0'>
                                                            <img src={vehicleImage} className='max-h-fit min-w-full' />
                                                        </div>
                                                    </div>
                                                </div>

                                                <dl className='space-y-4 border-t border-gray-200 py-6 px-4 sm:px-6'>
                                                    <h5 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{vehicleName}</h5>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm font-bold'>Trip Start Date</dt>
                                                        <dd className='text-sm font-medium text-gray-900'>{format(new Date(checkoutDetails.startTime), 'PPP') + "|"+ format(new Date(checkoutDetails.startTime), 'h:mm a')}</dd>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm font-bold'>Trip End Date</dt>
                                                        <dd className='text-sm font-medium text-gray-900'>{format(new Date(checkoutDetails.endTime), 'PPP') + "|"+ format(new Date(checkoutDetails.endTime), 'h:mm a') } </dd>
                                                    </div>
                                                </dl>
                                                <dl className='space-y-6 border-t border-gray-200 py-6 px-4 sm:px-6'>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm '>Trip Duration</dt>
                                                        <dd className='text-sm font-medium text-gray-900'>{checkoutDetails.totalDays} Days</dd>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm'>Trip Amount</dt>
                                                        {checkoutDetails.tripamount && (
                                                            <dd className='text-sm font-medium text-gray-900'>${checkoutDetails.tripamount.toFixed(2)}</dd>
                                                        )}
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm'>Taxes</dt>
                                                        {checkoutDetails.taxAmount && (
                                                            <dd className='text-sm font-medium text-gray-900'>${checkoutDetails.taxAmount.toFixed(2)}</dd>
                                                        )}
                                                    </div>
                                                    <div className='flex items-center justify-between border-t border-gray-200 pt-6'>
                                                        <dt className='text-base font-medium'>Total Amount</dt>
                                                        {checkoutDetails.tripTaxAmount && (
                                                            <dd className='text-lg font-bold text-gray-900'>${checkoutDetails.tripTaxAmount.toFixed(2)}</dd>
                                                        )}
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>
                                    )}

                                    {userRequestType === 'modify' && (
                                        <div className='mt-6 lg:mt-0'>
                                            <div className='mt-4 rounded-lg border border-gray-200 bg-white shadow-sm'>
                                                <div className='flex py-6 px-4 sm:px-6'>
                                                    <div className='sm:overflow-hidden rounded-lg '>
                                                        <div className='flex-shrink-0'>
                                                            <img src={vehicleImage} className='max-h-fit min-w-full' />
                                                        </div>
                                                    </div>
                                                </div>

                                                <dl className='space-y-4 border-t border-gray-200 py-6 px-4 sm:px-6'>
                                                    <h5 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{vehicleName}</h5>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm font-bold'>Modified Trip Start Date</dt>
                                                        <dd className='text-sm font-medium text-gray-900'>{format(new Date(checkoutDetails.startTime), 'PPP') + "|"+ format(new Date(checkoutDetails.startTime), 'h:mm a')}</dd>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm font-bold'>Modified Trip End Date</dt>
                                                        <dd className='text-sm font-medium text-gray-900'>{format(new Date(checkoutDetails.endTime), 'PPP') + "|"+ format(new Date(checkoutDetails.endTime), 'h:mm a')}</dd>
                                                    </div>
                                                </dl>
                                                <dl className='space-y-6 border-t border-gray-200 py-6 px-4 sm:px-6'>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm '>Total Modified Days</dt>
                                                        <dd className='text-sm font-medium text-gray-900'>
                                                            {checkoutDetails.totalDays} {checkoutDetails.totalDays == 1 ? 'Day' : 'Days'}
                                                        </dd>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm'>Trip Amount</dt>
                                                        {checkoutDetails.tripamount && (
                                                            <dd className='text-sm font-medium text-gray-900'>${checkoutDetails.tripamount.toFixed(2)}</dd>
                                                        )}
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <dt className='text-sm'>Taxes</dt>
                                                        {checkoutDetails.taxAmount && (
                                                            <dd className='text-sm font-medium text-gray-900'>${checkoutDetails.taxAmount.toFixed(2)}</dd>
                                                        )}
                                                    </div>
                                                    <div className='flex items-center justify-between border-t border-gray-200 pt-6'>
                                                        <dt className='text-base font-medium'>Total Amount</dt>
                                                        {checkoutDetails.tripTaxAmount && (
                                                            <dd className='text-lg font-bold text-gray-900'>${checkoutDetails.tripTaxAmount.toFixed(2)}</dd>
                                                        )}
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>
                                    )}

                                    <div className=' pt-5 flex flex-col gap-2'>
                                        <div className='p-4 bg-white shadow-md rounded-sm' id='payment-element'></div>
                                        <div className='border-t border-gray-200 py-6 px-4 sm:px-6'>
                                            {elementFetched ? (
                                                <Button size='lg' className='w-full h-12' onClick={submit} disabled={paybuttontext === 'Processing Payment'}>
                                                    {paybuttontext === 'Processing Payment' ? (
                                                        <svg
                                                            aria-hidden='true'
                                                            className='w-5 h-5 mr-4 text-white/30 animate-spin  fill-white'
                                                            viewBox='0 0 100 101'
                                                            fill='none'
                                                            xmlns='http://www.w3.org/2000/svg'>
                                                            <path
                                                                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                                                fill='currentColor'
                                                            />
                                                            <path
                                                                className='w-10 h-10'
                                                                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                                                fill='currentFill'
                                                            />
                                                        </svg>
                                                    ) : null}{' '}
                                                    {paybuttontext}
                                                </Button>
                                            ) : (
                                                <div className='pt-5 flex flex-col gap-2'>
                                                    <div className='col-span-4 space-y-4 lg:col-span-1'>
                                                        <div className={`relative h-10  rounded-lg bg-neutral-300 ${shimmer}`} />
                                                        <div className=' flex gap-9'>
                                                            <div className={`relative h-10 w-[60%] rounded-lg bg-neutral-300 ${shimmer}`} />
                                                            <div className={`relative h-10 w-[40%] rounded-lg bg-neutral-300 ${shimmer}`} />
                                                        </div>
                                                        <div className={`relative h-10 rounded-lg bg-neutral-300 ${shimmer}`} />
                                                        <div className={`relative h-4 rounded-md bg-neutral-300 ${shimmer}`} />
                                                        <div className={`relative h-4 w-[50%] rounded-md bg-neutral-300 ${shimmer}`} />
                                                    </div>
                                                    <hr className='my-4' />
                                                    <div className={`relative h-12 rounded-md bg-neutral-300 ${shimmer}`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
