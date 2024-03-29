'use client';

import usePersona, { profileVerifiedStatus } from '@/hooks/usePersona';

import CustomDateRangePicker from '@/components/custom/CustomDateRangePicker';
import TimeSelect from '@/components/custom/TimeSelect';
import { VehiclesDetailsSkeleton, shimmer } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import useWishlist from '@/hooks/useWishlist';
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
import { toast } from '@/components/ui/use-toast';
import { addToRecentlyViewedHistory, getVehicleAllDetailsByVechicleId } from '@/server/vehicleOperations';
import { getSession } from '@/lib/auth';
import useLoginModal from '@/hooks/useLoginModal';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/custom/modal';
import { calculatePrice } from '@/server/priceCalculation';
import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import { IoInformationCircleOutline } from 'react-icons/io5';

export default function SingleVehicleDetails({ params, searchParams }: { params: { id: string }; searchParams: any }) {
    const loginModal = useLoginModal();
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

    const [isAirportDeliveryChoosen, setIsAirportDeliveryChoosen] = useState(false);
    const [isCustoumDelivery, setIsCustoumDelivery] = useState(false);
    const [customDeliveryLocation, setCustomDeliveryLocation] = useState(null);
    const [isAirportDeliveryAvailable, setIsAirportDeliveryAvailable] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const detailsResponse = await getVehicleAllDetailsByVechicleId(Number(params.id));
                if (detailsResponse.success) {
                    const data = detailsResponse.data;

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
                    setVehicleHostDetails(data.vehicleHostDetails[0] || null);
                    setVehicleBusinessConstraints(data.vehicleBusinessConstraints || null);

                    const deliveryDetails = extractFirstDeliveryDetails(data.vehicleBusinessConstraints || null);
                    setIsAirportDeliveryAvailable(deliveryDetails?.deliveryToAirport);

                    if (data.vehicleHostDetails[0]) {
                        await getPriceCalculation();
                    }

                    const session = await getSession();
                    if (session.isLoggedIn) {
                        await addToRecentlyViewedHistory(Number(params.id));
                        setUserAuthenticated(true);
                    }
                } else {
                    setError(detailsResponse.message);
                    throw new Error(detailsResponse.message);
                }
            } catch (error) {
                console.error('Error fetching data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    useEffect(() => {
        const fetchData = async () => {
            await getPriceCalculation();
        };

        fetchData();
    }, [startDate, endDate, startTime, endTime, vehicleHostDetails, searchParams, isCustoumDelivery, isAirportDeliveryChoosen]);

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
            if (isAirportDeliveryChoosen) {
                payload.airportDelivery = true;
                payload.customDelivery = false;
            } else if (isCustoumDelivery) {
                payload.airportDelivery = false;
                payload.customDelivery = true;
            }

            // console.log(payload, 'payload');

            const responseData: any = await calculatePrice(payload);
            // console.log(responseData);

            if (responseData.success) {
                const data = responseData.data;
                setPriceCalculatedList(data.priceCalculatedList?.[0]);
                setDeductionConfigData(data.deductionDetails?.[0]);
            } else {
                setIsPriceError(true);
                setPriceErrorMessage(responseData.message);
            }
        } catch (error) {
            console.log(error);
            setPriceErrorMessage(error.message);
            setIsPriceError(true);
        } finally {
            setPriceLoading(false);
        }
    }

    async function requestToCheckOutHandler(make, model, year, image, vehicleId) {
        const session = await getSession();

        if (!session.isLoggedIn && !session.userId) {
            loginModal.onOpen();
            return;
        }

        const isVerified = await profileVerifiedStatus();
        const deductionfrequencyconfigid = isVerified ? deductionConfigData.deductioneventconfigid : 1;
        isVerified ? setShowPersona(false) : setShowPersona(true);

        try {
            const delivery = isAirportDeliveryChoosen ? true : isCustoumDelivery ? true : false;
            const airportDelivery = isAirportDeliveryChoosen ? true : false;

            const deliveryDetails = extractFirstDeliveryDetails(vehicleBusinessConstraints);

            const deliveryCost = isAirportDeliveryChoosen
                ? deliveryDetails?.airportDeliveryCost
                : isCustoumDelivery
                  ? deliveryDetails?.nonAirportDeliveryCost
                  : 0;

            const checkoutDetails = {
                userId: session.userId,
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
                delivery: delivery,
                airportDelivery: airportDelivery,
                deliveryCost: delivery ? deliveryCost : 0,
                upCharges: priceCalculatedList.upcharges,
                extreaMilageCost: 0,
                Statesurchargetax: priceCalculatedList.stateSurchargeTax,
                Statesurchargeamount: priceCalculatedList.stateSurchargeAmount,
            };

            // console.log(checkoutDetails);
            secureLocalStorage.setItem('checkOutInfo', JSON.stringify(checkoutDetails));

            if (!isVerified) {
                secureLocalStorage.setItem(
                    'personaCallback',
                    JSON.stringify({
                        origin: 'booking',
                        onSuccess: `/checkout/${vehicleId}`,
                    }),
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

    useScrollToTopOnLoad(isLoading);

    if (isLoading) {
        return (
            <div className='min-h-screen py-10'>
                <div className='mx-auto max-w-7xl flex-col '>
                    <VehiclesDetailsSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorComponent />;
    }

    return (
        <>
            <ClientOnly>
                <BoxContainer className='py-8'>
                    <div className='mt-3 grid grid-cols-1 gap-6 md:mt-6 md:grid-cols-2 md:gap-10 lg:grid-cols-3'>
                        <div className='flex flex-col lg:col-span-2'>
                            <VehicleDetailsComponent
                                vehicleDetails={vehicleDetails}
                                vehicleHostDetails={vehicleHostDetails}
                                vehicleImages={vehicleImages}
                                vehicleBusinessConstraints={vehicleBusinessConstraints}
                            />
                        </div>

                        <div className='mt-4 flex flex-col gap-4 lg:row-span-3 lg:mt-0'>
                            <div className='flex justify-between'>
                                <p className='text-3xl font-bold tracking-tight text-neutral-900'>{`$${vehicleDetails?.price_per_hr} / day`}</p>

                                {userAuthenticated && (
                                    <div className='mr-4 cursor-pointer'>
                                        {vehicleDetails?.wishList ? (
                                            <div onClick={() => removeFromWishlistHandler(vehicleDetails.id)}>
                                                <IoMdHeart className='h-10 w-10 text-red-500' />
                                            </div>
                                        ) : (
                                            <div onClick={() => addToWishlistHandler(vehicleDetails.id)}>
                                                <IoIosHeartEmpty className='h-10 w-10 text-red-500' />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='flex-2 flex w-full flex-col gap-2 '>
                                <DeliveryDetailsComponent
                                    vehicleBusinessConstraints={vehicleBusinessConstraints}
                                    vehicleDetails={vehicleDetails}
                                    isCustoumDelivery={isCustoumDelivery}
                                    setIsCustoumDelivery={setIsCustoumDelivery}
                                    city={searchParams.city}
                                    customDeliveryLocation={customDeliveryLocation}
                                    setCustomDeliveryLocation={setCustomDeliveryLocation}
                                    isAirportDeliveryChoosen={isAirportDeliveryChoosen}
                                    setIsAirportDeliveryChoosen={setIsAirportDeliveryChoosen}
                                />
                            </div>

                            <div className='flex-2 flex w-full flex-col gap-2'>
                                <CustomDateRangePicker
                                    vehicleid={params.id}
                                    setError={setError}
                                    setStartDate={setStartDate}
                                    setEndDate={setEndDate}
                                    startDate={format(new Date(startDate + 'T00:00:00'), 'yyyy-MM-dd')}
                                    endDate={format(new Date(endDate + 'T00:00:00'), 'yyyy-MM-dd')}
                                />

                                {!priceLoading && !priceCalculatedList && !isPriceError ? (
                                    <div className='mt-1 flex gap-2'>
                                        <IoInformationCircleOutline className='text-destructive' />
                                        <p className='text-sm font-normal text-destructive'>Invalid Dates. Please select different dates.</p>
                                    </div>
                                ) : null}
                            </div>

                            <div className='flex gap-6'>
                                <TimeSelect label='Trip Start Time' onChange={setStartTime} defaultValue={startTime} />
                                <TimeSelect label='Trip End Time' onChange={setEndTime} defaultValue={endTime} />
                            </div>

                            {isPriceError && (
                                <>
                                    {priceErrorMessage === 'Error: Wrong Dates' ? (
                                        <p className='text-sm text-red-500'>You have chosen wrong date format</p>
                                    ) : priceErrorMessage === 'Error: Reservation not allowed for previous dates' ? (
                                        <p className='text-sm text-red-500'>Booking not allowed for previous dates</p>
                                    ) : (
                                        <p className='text-sm text-red-500'>Something went wrong in calculating prices.</p>
                                    )}
                                </>
                            )}

                            <p className='text-sm text-neutral-600'>You will not be charged until the host accepts the reservation request.</p>

                            <div className=''>
                                {priceLoading ? (
                                    <div className={`h-8 w-full rounded-md bg-neutral-200 ${shimmer}`} />
                                ) : isPriceError ? null : (
                                    <PriceDisplayComponent pricelist={priceCalculatedList} isAirportDeliveryChoosen={isAirportDeliveryChoosen} />
                                )}
                            </div>

                            <Button
                                type='button'
                                size='lg'
                                className='mt-6 flex w-full'
                                disabled={!!error || priceLoading || isPriceError || !priceCalculatedList}
                                onClick={() => {
                                    if (isCustoumDelivery && !customDeliveryLocation) {
                                        toast({
                                            duration: 4000,
                                            className: 'bg-red-400 text-white',
                                            title: 'Please enter a custom delivery location.',
                                            description: 'The custom delivery location is required for this booking.',
                                        });
                                        return;
                                    }
                                    requestToCheckOutHandler(
                                        vehicleDetails.make,
                                        vehicleDetails.model,
                                        vehicleDetails.year,
                                        vehicleImages[0]?.imagename,
                                        vehicleDetails.id,
                                    );
                                }}>
                                {priceLoading ? <span className='loader'></span> : ' Proceed to book'}
                            </Button>
                        </div>
                    </div>
                </BoxContainer>

                <Modal
                    isOpen={showPersona}
                    onClose={() => {
                        setShowPersona(false);
                    }}
                    className='lg:max-w-2xl'>
                    <ModalHeader
                        onClose={() => {
                            setShowPersona(false);
                        }}>
                        Verify your driving licence
                    </ModalHeader>
                    <ModalBody className=' overflow-hidden'>
                        <p className='font-medium  leading-6'>Oops, Your Profile is not verified, Please continue to verify your driving license.</p>
                        <div className=' mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-end'>
                            <Button type='button' size='sm' onClick={() => setShowPersona(false)} variant='outline' className='w-full md:w-fit'>
                                Back
                            </Button>

                            <Button
                                type='button'
                                size='sm'
                                onClick={() => {
                                    createClient(setShowPersona);
                                }}
                                disabled={isPersonaClientLoading}
                                className='w-full bg-primary md:w-fit'>
                                {isPersonaClientLoading ? (
                                    <div className='flex px-16'>
                                        <div className='loader'></div>
                                    </div>
                                ) : (
                                    <> Continue Verification</>
                                )}
                            </Button>
                        </div>
                    </ModalBody>
                </Modal>
            </ClientOnly>
        </>
    );
}
