'use client';
import usePersona, { profileVerifiedStatus } from '@/hooks/usePersona';

import BackButton from '@/components/BackButton';
import BoxContainer from '@/components/BoxContainer';
import ClientOnly from '@/components/ClientOnly';
import ErrorComponent from '@/components/custom/ErrorComponent';
import TimeSelect from '@/components/custom/TimeSelect';
import { VehiclesDetailsSkeleton, shimmer } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { toast } from '@/components/ui/use-toast';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import useLoginModal from '@/hooks/useLoginModal';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import useWishlist from '@/hooks/useWishlist';
import { getSession } from '@/lib/auth';
import { convertToCarTimeZoneISO, getCurrentDatePlusHours, getCurrentTimeRounded } from '@/lib/utils';
import { calculatePrice } from '@/server/priceCalculation';
import { addToRecentlyViewedHistory, getVehicleAllDetailsByVechicleId } from '@/server/vehicleOperations';
import { addDays, format, isToday } from 'date-fns';
import { useQueryState } from 'next-usequerystate';
import { useEffect, useState } from 'react';
import { IoIosHeartEmpty, IoMdHeart } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';
import secureLocalStorage from 'react-secure-storage';
import DeliveryDetailsComponent from './DeliveryDetailsComponent';
import PriceDisplayComponent from './PriceDisplayComponent';
import VehicleDetailsComponent from './VehicleDetailsComponent';
import DateRangeCalendar from './DateRangeCalendar';

export default function SingleVehicleDetails({ params, searchParams }: { params: { id: string }; searchParams: any }) {
    const loginModal = useLoginModal();
    const { addToWishlistHandler, removeFromWishlistHandler, isItemWishlisted } = useWishlist(params.id);
    const { isPersonaClientLoading, createClient } = usePersona();
    const { isLoading: datesLoading, isError: datesError } = useAvailabilityDates(params.id, null);

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

    const [showDrivingLicenceModal, setShowDrivingLicenceModal] = useState(false);

    const [userAuthenticated, setUserAuthenticated] = useState(false);

    const [startDate, setStartDate] = useQueryState('startDate', {
        defaultValue: format(getCurrentDatePlusHours(3) || new Date(), 'yyyy-MM-dd'),
        history: 'replace',
    });
    const [endDate, setEndDate] = useQueryState('endDate', {
        defaultValue: format(addDays(getCurrentDatePlusHours(3) || new Date(), 2), 'yyyy-MM-dd'),
        history: 'replace',
    });

    const todayDate = new Date(startDate + 'T' + getCurrentTimeRounded());

    const [startTime, setStartTime] = useQueryState('startTime', { defaultValue: getCurrentTimeRounded() || '10:00:00', history: 'replace' });
    const [endTime, setEndTime] = useQueryState('endTime', { defaultValue: getCurrentTimeRounded() || '10:00:00', history: 'replace' });

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

    async function requestToCheckOutHandler(make: any, model: any, year: any, image: any, vehicleId: any, zipcode: any) {
        const session = await getSession();

        if (!session.isLoggedIn && !session.userId) {
            loginModal.onOpen();
            return;
        }

        const isVerified = await profileVerifiedStatus();
        const deductionfrequencyconfigid = isVerified ? deductionConfigData.deductioneventconfigid : 1;
        isVerified ? setShowDrivingLicenceModal(false) : setShowDrivingLicenceModal(true);

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
                // startTime: new Date(startDate + 'T' + startTime).toISOString(),
                // endTime: new Date(endDate + 'T' + endTime).toISOString(),
                startTime: convertToCarTimeZoneISO(startDate, startTime, vehicleDetails?.zipcode),
                endTime: convertToCarTimeZoneISO(endDate, endTime, vehicleDetails?.zipcode),
                totalDays: priceCalculatedList.numberOfDays,
                taxAmount: priceCalculatedList.taxAmount,
                tripTaxAmount: priceCalculatedList.tripTaxAmount,
                totalamount: priceCalculatedList.totalAmount,
                tripamount: priceCalculatedList.tripAmount,
                pickupTime: startTime,
                dropTime: endTime,

                comments: 'Request to book',
                address1: delivery ? customDeliveryLocation : vehicleDetails?.address1,
                address2: '',
                cityName: '',
                country: '',
                state: '',
                zipCode: vehicleDetails?.zipcode,
                latitude: '',
                longitude: '',
                ...priceCalculatedList,
                taxPercentage: priceCalculatedList.taxPercentage * 100,
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

    function extractFirstDeliveryDetails(constraintsArray: any[]) {
        try {
            const firstDeliveryDetails = constraintsArray.find((constraint: { constraintName: string }) => constraint.constraintName === 'DeliveryDetails');

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
                <div className='py-4 md:container lg:px-[4rem]'>
                    <div className='grid grid-cols-1 gap-6 md:gap-6 lg:grid-cols-3'>
                        <div className='flex flex-col items-start lg:col-span-2'>
                            <VehicleDetailsComponent
                                vehicleDetails={vehicleDetails}
                                vehicleHostDetails={vehicleHostDetails}
                                vehicleImages={vehicleImages}
                                vehicleBusinessConstraints={vehicleBusinessConstraints}
                                wishlistButton={
                                    userAuthenticated && (
                                        <div className='absolute right-[3%] top-[6%] cursor-pointer rounded-md bg-white p-1 lg:hidden'>
                                            <div>
                                                <svg
                                                    stroke='currentColor'
                                                    fill='currentColor'
                                                    strokeWidth={0}
                                                    viewBox='0 0 512 512'
                                                    className='size-7 text-red-500'
                                                    height='1em'
                                                    width='1em'
                                                    xmlns='http://www.w3.org/2000/svg'>
                                                    <path d='M352 56h-1c-39.7 0-74.8 21-95 52-20.2-31-55.3-52-95-52h-1c-61.9.6-112 50.9-112 113 0 37 16.2 89.5 47.8 132.7C156 384 256 456 256 456s100-72 160.2-154.3C447.8 258.5 464 206 464 169c0-62.1-50.1-112.4-112-113zm41.6 229.2C351 343.5 286.1 397.3 256 420.8c-30.1-23.5-95-77.4-137.6-135.7C89.1 245.1 76 198 76 169c0-22.6 8.8-43.8 24.6-59.8 15.9-16 37-24.9 59.6-25.1H161.1c14.3 0 28.5 3.7 41.1 10.8 12.2 6.9 22.8 16.7 30.4 28.5 5.2 7.9 14 12.7 23.5 12.7s18.3-4.8 23.5-12.7c7.7-11.8 18.2-21.6 30.4-28.5 12.6-7.1 26.8-10.8 41.1-10.8h.9c22.5.2 43.7 9.1 59.6 25.1 15.9 16 24.6 37.3 24.6 59.8-.2 29-13.3 76.1-42.6 116.2z' />
                                                </svg>
                                            </div>
                                        </div>
                                    )
                                }
                            />
                        </div>

                        <div className='container mt-4 flex flex-col gap-6 border-t border-neutral-200 pt-4 md:border-0 lg:row-span-3 lg:mt-0'>
                            <div className='flex justify-between'>
                                <h2 className='tracking-tight'>{`$${vehicleDetails?.price_per_hr} / day`}</h2>
                                {userAuthenticated && (
                                    <div className='mr-4 hidden cursor-pointer lg:block'>
                                        {isItemWishlisted ? (
                                            <div onClick={() => removeFromWishlistHandler(vehicleDetails.id)}>
                                                <IoMdHeart className='size-10 text-red-500' />
                                            </div>
                                        ) : (
                                            <div onClick={() => addToWishlistHandler(vehicleDetails.id)}>
                                                <IoIosHeartEmpty className='size-10 text-red-500' />
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
                                <DateRangeCalendar
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
                                <TimeSelect
                                    label='Trip Start Time'
                                    onChange={setStartTime}
                                    defaultValue={startTime}
                                    disableLimitTime={isToday(todayDate) && isToday(new Date()) ? getCurrentTimeRounded() : null}
                                />
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

                            <p className='text-14 text-neutral-600'>You will not be charged until the host accepts the reservation request.</p>

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
                                className='mt-5 flex w-full'
                                disabled={!!error || priceLoading || isPriceError || !priceCalculatedList || datesLoading || datesError}
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
                                        vehicleDetails.zipcode,
                                    );
                                }}>
                                {priceLoading ? <span className='loader'></span> : ' Proceed to book'}
                            </Button>
                        </div>
                    </div>

                    <DrivingLicenceModal
                        setShowDrivingLicenceModal={setShowDrivingLicenceModal}
                        showDrivingLicenceModal={showDrivingLicenceModal}
                        createClient={createClient}
                        isPersonaClientLoading={isPersonaClientLoading}
                    />
                </div>
            </ClientOnly>
        </>
    );
}

function DrivingLicenceModal({
    showDrivingLicenceModal,
    setShowDrivingLicenceModal,
    createClient,
    isPersonaClientLoading,
}: {
    showDrivingLicenceModal: boolean;
    setShowDrivingLicenceModal: React.Dispatch<React.SetStateAction<boolean>>;
    createClient: (setShowDrivingLicenceModal: React.Dispatch<React.SetStateAction<boolean>>) => void;
    isPersonaClientLoading: boolean;
}) {
    return (
        <ResponsiveDialog
            title=' Driving licence verification'
            description=''
            isOpen={showDrivingLicenceModal}
            closeOnClickOutside={false}
            openDialog={() => {
                setShowDrivingLicenceModal(true);
            }}
            closeDialog={() => {
                setShowDrivingLicenceModal(false);
            }}>
            <p className='mt-4 max-w-2xl text-sm leading-snug text-neutral-500'>
                Your driving license has not yet been verified. <br />
                Please verify it.
            </p>
            <div className=' mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-end'>
                <Button type='button' size='sm' onClick={() => setShowDrivingLicenceModal(false)} variant='outline' className='w-full md:w-fit'>
                    Back
                </Button>

                <Button
                    type='button'
                    variant='black'
                    size='sm'
                    onClick={() => {
                        createClient(setShowDrivingLicenceModal);
                    }}
                    loading={isPersonaClientLoading}
                    className='w-full bg-primary md:w-fit'>
                    Continue Verification
                </Button>
            </div>
        </ResponsiveDialog>
    );
}
