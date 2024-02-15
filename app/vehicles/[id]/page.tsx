'use client';

import usePersona, { profileVerifiedStatus } from '@/hooks/usePersona';

import { addToRecentlyViewedHistory } from '@/app/_actions/add_to_recently_viewed';
import { calculatePrice } from '@/app/_actions/calculatePrice';
import { getVehicleAllDetailsByVechicleId } from '@/app/_actions/get_vehicle_details_by_vehicle_id';
import CustomDateRangePicker from '@/components/custom/CustomDateRangePicker';
import TimeSelect from '@/components/custom/TimeSelect';
import { VehiclesDetailsSkeleton, shimmer } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import useWishlist from '@/hooks/useWishlist';
import { RecentlyViewedVehicles } from '@/lib/local_recently_viewed';
import { addDays, format } from 'date-fns';
import { useQueryState } from 'next-usequerystate';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoIosHeartEmpty, IoMdHeart } from 'react-icons/io';
import secureLocalStorage from 'react-secure-storage';
import DeliveryDetailsComponent from './DeliveryDetailsComponent';
import PriceDisplayComponent from './PriceDisplayComponent';
import VehicleDetailsComponent from './VehicleDetailsComponent';
import ClientOnly from '@/components/ClientOnly';
import { CgFormatSlash } from 'react-icons/cg';

export default function SingleVehicleDetails({ params, searchParams }: { params: { id: string }; searchParams: any }) {
    const { addToWishlistHandler, removeFromWishlistHandler } = useWishlist();
    const { isPersonaClientLoading, createClient } = usePersona();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [vehicleDetails, setVehicleDetails] = useState(null);
    const [vehicleImages, setVehicleImages] = useState([]);
    const [vehicleHostDetails, setVehicleHostDetails] = useState(null);
    const [vehicleBusinessConstraints, setVehicleBusinessConstraints] = useState(null);
    const [deductionConfigData, setDeductionConfigData] = useState(null);

    const [priceLoading, setPriceLoading] = useState(false);
    const [priceCalculatedList, setPriceCalculatedList] = useState(null);
    const [isPriceError, setIsPriceError] = useState(false);
    const [priceErrorMessage, setPriceErrorMessage] = useState(null);

    const [showPersona, setShowPersona] = useState(false);

    const [userAuthenticated, setUserAuthenticated] = useState(false);

    const [startDate, setStartDate] = useQueryState('startDate', { defaultValue: format(new Date(), 'yyyy-MM-dd'), history: 'replace' });
    const [endDate, setEndDate] = useQueryState('endDate', { defaultValue: format(addDays(new Date(), 3), 'yyyy-MM-dd'), history: 'replace' });

    const [startTime, setStartTime] = useQueryState('startTime', { defaultValue: '10:00:00', history: 'replace' });
    const [endTime, setEndTime] = useQueryState('endTime', { defaultValue: '08:00:00', history: 'replace' });

    const [isAirportDelivery, setIsAirportDelivery] = useState(false);
    const [isCustoumDelivery, setIsCustoumDelivery] = useState(false);
    const [customDeliveryLocation, setCustomDeliveryLocation] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('auth_token_login') || '';
                const body = {
                    vehicleid: params.id,
                    userId: localStorage.getItem('userId') || '',
                };

                const data = await getVehicleAllDetailsByVechicleId(body, token);
                setVehicleDetails(data.vehicleAllDetails?.[0] || null);

                let images = [...data.vehicleAllDetails?.[0]?.imageresponse].sort((a, b) => {
                    // Sort records with isPrimary true first
                    if (a.isPrimary && !b.isPrimary) {
                        return -1;
                    } else if (!a.isPrimary && b.isPrimary) {
                        return 1;
                    } else {
                        // For records with the same isPrimary value, maintain their original order
                        return a.orderNumber - b.orderNumber;
                    }
                });

                setVehicleImages(images || null);
                setVehicleHostDetails(data.vehicleHostDetails?.[0] || null);
                setVehicleBusinessConstraints(data.vehicleBusinessConstraints || null);

                if (vehicleDetails && vehicleImages.length > 0) {
                    localSessionStorageHandler(vehicleDetails, vehicleImages);
                }

                const deliveryDetails = extractFirstDeliveryDetails(data.vehicleBusinessConstraints || null);
                setIsAirportDelivery(deliveryDetails?.deliveryToAirport);

                const user = localStorage.getItem('userId');
                await getPriceCalculation();
                if (user) {
                    await addToRecentlyViewedHistory(user, params.id, token);
                }
            } catch (error) {
                console.error('Error fetching data', error);
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        const user = localStorage.getItem('userId');
        if (user) {
            setUserAuthenticated(true);
        }

        fetchData();
    }, [params]);

    useEffect(() => {
        const fetchData = async () => {
            await getPriceCalculation();
        };

        fetchData();
    }, [startDate, endDate, startTime, endTime, isCustoumDelivery, searchParams, isAirportDelivery]);

    async function getPriceCalculation() {
        try {
            setIsPriceError(false);
            setPriceLoading(true);
            const payload: any = {
                vehicleid: Number(params.id),
                startTime: new Date(startDate + 'T' + startTime).toISOString(),
                endTime: new Date(endDate + 'T' + endTime).toISOString(),
                airportDelivery: false,
                customDelivery: false,
                hostid: vehicleHostDetails?.hostID,
            };

            // Modify payload based on conditions
            if (isAirportDelivery) {
                payload.airportDelivery = true;
                payload.customDelivery = false;
            } else if (isCustoumDelivery) {
                payload.airportDelivery = false;
                payload.customDelivery = true;
            }

            // console.log(payload, 'payload');

            const authToken = localStorage.getItem('bundee_auth_token');
            const responseData: any = await calculatePrice(payload, authToken);

            if (responseData.errorCode == 0) {
                setPriceCalculatedList(responseData.priceCalculatedList?.[0]);
                setDeductionConfigData(responseData.deductionDetails?.[0]);
            } else {
                setIsPriceError(true);
                setPriceErrorMessage(responseData.errormessage);
            }
        } catch (error) {
            console.log(error);
            setPriceErrorMessage(error.message);
            setIsPriceError(true);
        } finally {
            setPriceLoading(false);
        }
    }

    function localSessionStorageHandler(vehicleDetails, vehicleImageResponse) {
        const vehicle = {
            vehicleId: vehicleDetails.id ?? params.id,
            make: vehicleDetails.make,
            model: vehicleDetails.model,
            year: vehicleDetails.year,
            image: vehicleImageResponse[0].imagename,
            price: vehicleDetails.price_per_hr,
            tripCount: vehicleDetails.tripcount,
        };

        RecentlyViewedVehicles.addVehicle(vehicle);
    }

    async function requestToCheckOutHandler(make, model, year, image, vehicleId) {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            const { pathname, search, hash } = window.location;
            const pathAndQuery = `${pathname}${search}${hash}`;

            localStorage.setItem('authCallbackSuccessUrl', pathAndQuery);
            window.location.href = '/auth/login';
            return;
        }

        const isVerified = await profileVerifiedStatus();
        const deductionfrequencyconfigid = isVerified ? deductionConfigData.deductioneventconfigid : 1;
        isVerified ? setShowPersona(false) : setShowPersona(true);

        try {
            const userId = localStorage.getItem('userId');

            const delivery = searchParams?.isAirport == 'true' ? true : isCustoumDelivery ? true : false;

            const deliveryDetails = extractFirstDeliveryDetails(vehicleBusinessConstraints);

            const deliveryCost = searchParams?.isAirport == 'true' ? deliveryDetails?.airportDeliveryCost : isCustoumDelivery ? deliveryDetails?.nonAirportDeliveryCost : 0;

            const checkoutDetails = {
                userId: userId,
                vehicleid: vehicleDetails.id,
                price: vehicleDetails.price_per_hr,
                name: `${make} ${model} ${year}`,
                image: image,
                type: 'reservation',
                deductionfrequencyconfigid,
                paymentauthorizationconfigid: deductionConfigData.authorizationConfigId,
                authorizationpercentage: priceCalculatedList.authPercentage,
                authorizationamount: priceCalculatedList.authAmount,
                perDayAmount: priceCalculatedList.pricePerDay,
                startTime: new Date(startDate + 'T' + startTime).toISOString(),
                endTime: new Date(endDate + 'T' + endTime).toISOString(),
                totalDays: priceCalculatedList.numberOfDays,
                taxAmount: priceCalculatedList.taxAmount,
                tripTaxAmount: priceCalculatedList.tripTaxAmount,
                totalamount: priceCalculatedList.totalAmount,
                tripamount: priceCalculatedList.tripAmount,
                pickupTime: startTime,
                dropTime: endTime,

                comments: 'Request to book',
                address1: customDeliveryLocation ? customDeliveryLocation : vehicleDetails?.address1,
                address2: '',
                cityName: '',
                country: '',
                state: '',
                zipCode: '',
                latitude: '',
                longitude: '',
                ...priceCalculatedList,
                tripDiscountedAmount: priceCalculatedList.discountAmount,
                delivery: delivery,
                deliveryCost: delivery ? deliveryCost : 0,
                upCharges: priceCalculatedList.upcharges,
            };

            console.log(checkoutDetails);
            secureLocalStorage.setItem('checkOutInfo', JSON.stringify(checkoutDetails));

            if (!isVerified) {
                secureLocalStorage.setItem(
                    'personaCallback',
                    JSON.stringify({
                        origin: 'booking',
                        onSuccess: `/checkout/${vehicleId}`,
                    })
                );
            } else {
                window.location.href = `/checkout/${vehicleId}`;
            }
        } catch (error) {
            console.log('Error handling checkout:', error);
            // Handle error
        }
    }

    function extractFirstDeliveryDetails(constraintsArray) {
        try {
            const firstDeliveryDetails = constraintsArray.find(constraint => constraint.constraintName === 'DeliveryDetails');

            if (firstDeliveryDetails) {
                const { deliveryToAirport, airportDeliveryCost, nonAirportDeliveryCost } = JSON.parse(firstDeliveryDetails.constraintValue);

                return {
                    deliveryToAirport,
                    airportDeliveryCost,
                    nonAirportDeliveryCost,
                };
            } else {
                return null;
            }
        } catch (error) {
            console.log(error);
        }
    }

    if (isLoading) {
        return (
            <div className='min-h-screen py-10'>
                <div className='mx-auto max-w-7xl flex-col '>
                    <VehiclesDetailsSkeleton />
                </div>
            </div>
        );
    }

    return (
        <>
            <ClientOnly>
                <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 py-2 mb-10 md:mb-14'>
                    <div className='pt-6'>
                        <nav aria-label='Breadcrumb' className='w-full lg:min-w-[80rem]'>
                            <div role='list' className='mr-auto flex items-center whitespace-nowrap'>
                                <div className='flex items-center'>
                                    <Link href='/' className=' text-sm font-medium text-neutral-900'>
                                        Home
                                    </Link>
                                    <CgFormatSlash className='h-6 w-6 text-neutral-300' />
                                </div>

                                <div className='flex items-center'>
                                    <Link href={`/vehicles?`} className=' text-sm font-medium text-neutral-900'>
                                        Available Vehicles
                                    </Link>
                                    <CgFormatSlash className='h-6 w-6 text-neutral-300' />
                                </div>

                                {vehicleDetails ? (
                                    <div className='text-sm'>
                                        <Link href={`/vehicles/${params.id}`} aria-current='page' className='font-medium text-neutral-500 hover:text-neutral-600'>
                                            {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.year}
                                        </Link>
                                    </div>
                                ) : (
                                    <div className='flex items-center justify-center'>....</div>
                                )}
                            </div>
                        </nav>

                        {vehicleDetails ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-3 md:mt-6'>
                                <div className='flex-col flex lg:col-span-2'>
                                    <VehicleDetailsComponent
                                        vehicleDetails={vehicleDetails}
                                        vehicleHostDetails={vehicleHostDetails}
                                        vehicleImages={vehicleImages}
                                        vehicleBusinessConstraints={vehicleBusinessConstraints}
                                    />
                                </div>

                                <div className='mt-4 lg:row-span-3 lg:mt-0 flex flex-col gap-4'>
                                    <div className='flex justify-between'>
                                        <p className='text-3xl font-bold tracking-tight text-neutral-900'>{`$${vehicleDetails.price_per_hr} / day`}</p>

                                        {userAuthenticated && (
                                            <div className='mr-4 cursor-pointer'>
                                                {vehicleDetails?.wishList ? (
                                                    <div onClick={() => removeFromWishlistHandler(vehicleDetails.id)}>
                                                        <IoMdHeart className='text-red-500 w-10 h-10' />
                                                    </div>
                                                ) : (
                                                    <div onClick={() => addToWishlistHandler(vehicleDetails.id)}>
                                                        <IoIosHeartEmpty className='text-red-500 w-10 h-10' />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-2 w-full flex-2 '>
                                        <DeliveryDetailsComponent
                                            vehicleBusinessConstraints={vehicleBusinessConstraints}
                                            vehicleDetails={vehicleDetails}
                                            isCustoumDelivery={isCustoumDelivery}
                                            setIsCustoumDelivery={setIsCustoumDelivery}
                                            city={searchParams.city}
                                            setCustomDeliveryLocation={setCustomDeliveryLocation}
                                        />
                                    </div>

                                    <div className='flex flex-col gap-2 w-full flex-2'>
                                        <CustomDateRangePicker
                                            vehicleid={params.id}
                                            setError={setError}
                                            setStartDate={setStartDate}
                                            setEndDate={setEndDate}
                                            startDate={format(new Date(startDate + 'T00:00:00'), 'yyyy-MM-dd')}
                                            endDate={format(new Date(endDate + 'T00:00:00'), 'yyyy-MM-dd')}
                                        />
                                    </div>

                                    <div className='flex gap-6'>
                                        <TimeSelect label='Trip Start Time' onChange={setStartTime} defaultValue={startTime} />
                                        <TimeSelect label='Trip End Time' onChange={setEndTime} defaultValue={endTime} />
                                    </div>

                                    {isPriceError && (
                                        <>
                                            {priceErrorMessage === 'Error: Wrong Dates' ? (
                                                <p className='text-red-500 text-sm'>You have chosen wrong date format</p>
                                            ) : priceErrorMessage === 'Error: Reservation not allowed for previous dates' ? (
                                                <p className='text-red-500 text-sm'>Booking not allowed for previous dates</p>
                                            ) : (
                                                <p className='text-red-500 text-sm'>Something went wrong in price calculation</p>
                                            )}
                                        </>
                                    )}

                                    <p className='text-sm text-neutral-600'>You will not be charged until the host accepts the reservation request.</p>

                                    <div className='flex items-center justify-between'>
                                        {priceLoading ? (
                                            <div className={`h-8 w-full rounded-md bg-neutral-200 ${shimmer}`} />
                                        ) : isPriceError ? null : ( // <h3 className='text-lg md:text-xl  font-semibold text-neutral-900'>Total Rental Charge: $0</h3>
                                            <div className='flex flex-wrap justify-between gap-4 w-full items-center'>
                                                <h3 className='text-lg md:text-lg  text-neutral-900'>
                                                    Total: <span className='font-semibold'>${parseFloat(priceCalculatedList?.tripTaxAmount).toFixed(2)} </span>
                                                </h3>
                                                <PriceDisplayComponent pricelist={priceCalculatedList} />
                                            </div>
                                        )}
                                    </div>
                                    <hr />
                                    {priceCalculatedList?.numberOfDaysDiscount > 0 && priceCalculatedList?.discountAmount > 0 ? (
                                        <div className='space-y-2'>
                                            <p className='font-semibold'>Discounts</p>
                                            <p className='text-sm text-neutral-600'>The following discounts have been applied to your booking</p>
                                            <div className='flex justify-between gap-4 items-center'>
                                                <p>
                                                    {priceCalculatedList?.discountPercentage}% discount for {priceCalculatedList?.numberOfDaysDiscount} days or more rental
                                                </p>
                                                <div className=' font-medium text-green-500 whitespace-nowrap '>$ {parseFloat(priceCalculatedList?.discountAmount).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <Button
                                        type='button'
                                        size='lg'
                                        className='mt-4 flex w-full'
                                        disabled={!!error || priceLoading || isPriceError}
                                        onClick={() =>
                                            requestToCheckOutHandler(vehicleDetails.make, vehicleDetails.model, vehicleDetails.year, vehicleImages[0]?.imagename, vehicleDetails.id)
                                        }>
                                        {priceLoading ? <span className='loader'></span> : ' Proceed to book'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className='text-center mt-10 py-12 md:py-20'>{isLoading ? <p>Loading...</p> : <p>Error: Failed to fetch vehicle details.</p>}</div>
                        )}
                    </div>
                </div>

                {showPersona && (
                    <div>
                        <div className='fixed inset-0 z-40 flex items-end bg-black bg-opacity-20 sm:items-center sm:justify-center appear-done enter-done backdrop-blur-[4px]'>
                            <div className='w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg sm:rounded-lg sm:m-4 md:max-w-3xl md:p-7 appear-done enter-done' role='dialog'>
                                <div data-focus-lock-disabled='false'>
                                    <header className='flex justify-between gap-2'>
                                        <div>
                                            <h1>Verify your driving licence</h1>
                                        </div>

                                        <Button
                                            variant='ghost'
                                            className='inline-flex items-center justify-center p-2 text-neutral-600'
                                            aria-label='close'
                                            onClick={() => setShowPersona(false)}>
                                            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20' role='img' aria-hidden='true'>
                                                <path
                                                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                                    clipRule='evenodd'
                                                    fillRule='evenodd'></path>
                                            </svg>
                                        </Button>
                                    </header>
                                    <div className='flex justify-center w-full'></div>
                                    <div className='sm:col-span-2 mt-4 mb-4'>
                                        <label className='block text-md font-bold  leading-6 text-gray-900'>
                                            Oops, Your Profile is not verified, Please continue to verify your driving license.
                                        </label>
                                    </div>

                                    <footer className='flex items-center justify-end gap-3  '>
                                        <Button type='button' onClick={() => setShowPersona(false)} variant='outline'>
                                            Back to Details
                                        </Button>

                                        <Button
                                            type='button'
                                            onClick={() => {
                                                createClient(setShowPersona);
                                            }}
                                            disabled={isPersonaClientLoading}
                                            className='bg-primary'>
                                            {isPersonaClientLoading ? (
                                                <div className='flex px-16'>
                                                    <div className='loader'></div>
                                                </div>
                                            ) : (
                                                <p> Continue Verification</p>
                                            )}
                                        </Button>
                                    </footer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ClientOnly>
        </>
    );
}
