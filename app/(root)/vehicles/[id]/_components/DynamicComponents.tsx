'use client';

import PriceDisplayComponent from '@/components/custom/PriceDisplayComponent';
import TimeSelect from '@/components/custom/TimeSelect';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import useLoginDialog from '@/hooks/dialogHooks/useLoginDialog';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import usePriceCalculation from '@/hooks/usePriceCalculation';
import { getSession } from '@/lib/auth';
import { convertToCarTimeZoneISO, getCurrentDatePlusHours, getCurrentTimeRounded, getFullAddress } from '@/lib/utils';
import { addDays, format, isAfter, isBefore, isToday, parseISO, set } from 'date-fns';
import { useQueryState } from 'next-usequerystate';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'sonner';
import DateRangeCalendar from './DateRangeCalendar';
import DeliveryDetailsComponent from './DeliveryDetailsComponent';

interface DynamicComponentsProps {
    vehicleId: number;
    vehicleDetails: any;
    hostDetails: any;
    bussinessConstraints: any;
}

export default function DynamicComponents({ vehicleDetails, vehicleId, hostDetails, bussinessConstraints }: DynamicComponentsProps) {
    const searchParams = useSearchParams();

    const [startDate, setStartDate] = useQueryState('startDate', {
        defaultValue: format(getCurrentDatePlusHours(3) || new Date(), 'yyyy-MM-dd'),
        history: 'replace'
    });
    const [endDate, setEndDate] = useQueryState('endDate', {
        defaultValue: format(addDays(getCurrentDatePlusHours(3) || new Date(), 2), 'yyyy-MM-dd'),
        history: 'replace'
    });

    const todayDate = new Date(`${startDate}T${getCurrentTimeRounded()}`);

    const [startTime, setStartTime] = useQueryState('startTime', {
        defaultValue: getCurrentTimeRounded() || '10:00:00',
        history: 'replace'
    });
    const [endTime, setEndTime] = useQueryState('endTime', {
        defaultValue: getCurrentTimeRounded() || '10:00:00',
        history: 'replace'
    });

    const [isAirportDeliveryChoosen, setIsAirportDeliveryChoosen] = useState(false);
    const [isCustoumDeliveryChoosen, setIsCustoumDeliveryChoosen] = useState(false);
    const [customDeliveryLocation, setCustomDeliveryLocation] = useState(null);

    const { deductionConfigData, isPriceError, priceErrorMessage, priceLoading, priceCalculatedList } = usePriceCalculation({
        vehicleId: vehicleId,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        isAirportDelivery: isAirportDeliveryChoosen,
        isCustomDelivery: isCustoumDeliveryChoosen,
        hostId: hostDetails?.hostID,
        zipCode: vehicleDetails?.zipcode
    });

    const { isLoading: datesLoading, isError: datesError } = useAvailabilityDates(vehicleId, null);

    const loginModal = useLoginDialog();
    const drivingLicenceDialog = useDrivingLicenceDialog();

    const [datesSelectionError, setDatesSelectionError] = useState(null);

    const [error, setError] = useState(null);

    const [processing, setProcessing] = useState(false);

    async function requestToCheckOutHandler() {
        try {
            setProcessing(true);

            // 1. Check if the driver as choosen  custom delivery location and entered a valid location
            if (isCustoumDeliveryChoosen && !customDeliveryLocation) {
                toast.error('Please enter custom delivery location.');
                setProcessing(false);
                return;
            }

            // 2. check for short notice late night reservation

            const { isValid, error } = validateBookingTime(`${startDate}T${startTime}`);
            if (!isValid) {
                toast.error(error);
                setProcessing(false);
                return;
            }

            // 3. Check if user is logged in
            const session = await getSession();

            if (!session.isLoggedIn && !session.userId) {
                loginModal.onOpen();
                setProcessing(false);
                return;
            }

            // 4. Check if user has a valid driving licence
            // const isVerified = await profileVerifiedStatus();
            // if (!isVerified) {
            //     drivingLicenceDialog.isUpdate = false;
            //     drivingLicenceDialog.onOpen();
            //     setProcessing(false);
            //     return null;
            // }

            const delivery = isAirportDeliveryChoosen ? true : !!isCustoumDeliveryChoosen;
            const airportDelivery = !!isAirportDeliveryChoosen;

            const deliveryDetails = extractFirstDeliveryDetails(bussinessConstraints);

            const deliveryCost = isAirportDeliveryChoosen
                ? deliveryDetails?.airportDeliveryCost
                : isCustoumDeliveryChoosen
                  ? deliveryDetails?.nonAirportDeliveryCost
                  : 0;

            const checkoutDetails = {
                userId: session.userId,
                vehicleid: vehicleDetails.id,
                price: vehicleDetails.price_per_hr,
                name: `${vehicleDetails?.make} ${vehicleDetails?.model} ${vehicleDetails?.year}`,
                image: vehicleDetails?.imageresponse[0]?.imagename,
                type: 'reservation',
                deductionfrequencyconfigid: 1,
                paymentauthorizationconfigid: deductionConfigData.authorizationConfigId,
                authorizationpercentage: priceCalculatedList.authPercentage,
                authorizationamount: priceCalculatedList.authAmount,
                perDayAmount: priceCalculatedList.pricePerDay,
                startTime: convertToCarTimeZoneISO(`${startDate}T${startTime}`, vehicleDetails?.zipcode),
                endTime: convertToCarTimeZoneISO(`${endDate}T${endTime}`, vehicleDetails?.zipcode),
                totalDays: priceCalculatedList.numberOfDays,
                taxAmount: priceCalculatedList.taxAmount,
                tripTaxAmount: priceCalculatedList?.tripTaxAmount,
                totalamount: priceCalculatedList.totalAmount,
                tripamount: priceCalculatedList.tripAmount,
                pickupTime: startTime,
                dropTime: endTime,
                comments: 'Request to book',
                address1: '',
                address2: '',
                cityName: '',
                country: '',
                state: '',
                zipCode: vehicleDetails?.zipcode,
                latitude: '',
                longitude: '',
                ...priceCalculatedList,
                delivery: !!delivery,
                airportDelivery: airportDelivery,
                deliveryCost: delivery ? deliveryCost : 0,
                upCharges: priceCalculatedList.upcharges,
                extreaMilageCost: 0,
                Statesurchargetax: priceCalculatedList.stateSurchargeTax,
                Statesurchargeamount: priceCalculatedList.stateSurchargeAmount,

                plate: vehicleDetails.number || '',
                hostDetails: hostDetails,
                location: getFullAddress({ vehicleDetails: vehicleDetails })
            };

            console.log('checkoutDetails', checkoutDetails);

            secureLocalStorage.setItem('checkOutInfo', JSON.stringify(checkoutDetails));
            window.location.href = '/checkout/driving-licence';
            setProcessing(false);
        } catch (error) {
            console.log(error);
            setError(error);
            setProcessing(false);
        }
    }

    return (
        <>
            <DeliveryDetailsComponent
                businessConstraints={bussinessConstraints}
                isCustoumDeliveryChoosen={isCustoumDeliveryChoosen}
                setIsCustoumDeliveryChoosen={setIsCustoumDeliveryChoosen}
                city={searchParams.get('city') || ''}
                customDeliveryLocation={customDeliveryLocation}
                setCustomDeliveryLocation={setCustomDeliveryLocation}
                isAirportDeliveryChoosen={isAirportDeliveryChoosen}
                setIsAirportDeliveryChoosen={setIsAirportDeliveryChoosen}
            />

            <DateRangeCalendar
                vehicleid={vehicleId}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                startDate={format(new Date(`${startDate}T00:00:00`), 'yyyy-MM-dd')}
                endDate={format(new Date(`${endDate}T00:00:00`), 'yyyy-MM-dd')}
                setDatesSelectionError={setDatesSelectionError}
                zipCode={vehicleDetails?.zipcode}
                startTime={startTime}
                endTime={endTime}
                totalDays={priceCalculatedList?.numberOfDays}
            />

            {/* {!priceLoading && !priceCalculatedList && !isPriceError ? <ErrorMessage message={priceErrorMessage} /> : null} */}

            <div className='flex gap-6'>
                <TimeSelect
                    label='Trip Start Time'
                    onChange={setStartTime}
                    defaultValue={startTime}
                    disableLimitTime={isToday(todayDate) && isToday(new Date()) ? getCurrentTimeRounded() : null}
                />
                <TimeSelect label='Trip End Time' onChange={setEndTime} defaultValue={endTime} />
            </div>

            {isPriceError &&
                (priceErrorMessage === 'Error: Wrong Dates' ? (
                    <ErrorMessage message='You have chosen wrong date format' />
                ) : priceErrorMessage === 'Error: Reservation not allowed for previous dates' ? (
                    <ErrorMessage message='Trip not allowed for previous dates' />
                ) : (
                    <ErrorMessage message='Something went wrong in calculating prices.' />
                ))}

            <div>
                {priceLoading ? (
                    <Skeleton className='h-8 w-full animate-pulse rounded-md bg-neutral-200' />
                ) : isPriceError ? null : (
                    <PriceDisplayComponent pricelist={priceCalculatedList} isAirportDeliveryChoosen={isAirportDeliveryChoosen} />
                )}
            </div>

            <p className='text-14 text-neutral-600'>
                You will be refunded any amount charged on your card in the event that the host does not accept your reservation.
            </p>

            <ProcessedToBookButton
                error={error}
                priceLoading={priceLoading}
                isPriceError={isPriceError}
                priceCalculatedList={priceCalculatedList}
                datesLoading={datesLoading}
                datesError={datesError}
                datesSelectionError={datesSelectionError}
                processing={processing}
                requestToCheckOutHandler={requestToCheckOutHandler}
            />
        </>
    );
}

function ErrorMessage({ message }) {
    if (!message) return null;
    return (
        <div className='mt-1 flex gap-2'>
            <IoInformationCircleOutline className='text-destructive' />
            <p className='font-normal text-destructive text-sm'>{message}</p>
        </div>
    );
}

function ProcessedToBookButton({
    error,
    priceLoading,
    isPriceError,
    priceCalculatedList,
    datesLoading,
    datesError,
    datesSelectionError,
    processing,
    requestToCheckOutHandler
}) {
    return (
        <Button
            type='button'
            size='lg'
            className='mt-5 flex w-full'
            disabled={!!error || priceLoading || isPriceError || !priceCalculatedList || datesLoading || datesError || datesSelectionError || processing}
            loading={priceLoading || processing}
            loadingText='Loading'
            onClick={requestToCheckOutHandler}>
            Proceed to book
        </Button>
    );
}

function extractFirstDeliveryDetails(constraintsArray: any[]) {
    try {
        const firstDeliveryDetails = constraintsArray.find((constraint: { constraintName: string }) => constraint.constraintName === 'DeliveryDetails');

        if (firstDeliveryDetails) {
            const { deliveryToAirport, airportDeliveryCost, nonAirportDeliveryCost } = JSON.parse(firstDeliveryDetails.constraintValue);

            return {
                deliveryToAirport,
                airportDeliveryCost,
                nonAirportDeliveryCost
            };
        }
        return null;
    } catch (error) {
        console.log(error);
    }
}

function validateBookingTime(bookingDateTime: string) {
    // Convert input to Date object if string
    const bookingTime = typeof bookingDateTime === 'string' ? parseISO(bookingDateTime) : bookingDateTime;

    const now = new Date();
    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Set up time boundaries
    const todaySevenPM = set(today, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 });
    const tomorrowNoon = set(tomorrow, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
    const todayNoon = set(today, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });

    // If current time is after 7 PM
    if (isAfter(now, todaySevenPM)) {
        // No bookings allowed until next day noon
        if (isBefore(bookingTime, tomorrowNoon)) {
            return {
                isValid: false,
                error: `The trip can't start before ${format(tomorrowNoon, 'h:mm aa')} tomorrow due to car preparation time.`
            };
        }
    }
    // If current time is after midnight but before noon
    else if (isBefore(now, todayNoon) && now.getHours() < 12) {
        // No bookings allowed until today noon
        if (isBefore(bookingTime, todayNoon)) {
            return {
                isValid: false,
                error: `The trip can't start before ${format(tomorrowNoon, 'h:mm aa')} today due to car preparation time.`
            };
        }
    }

    return {
        isValid: true,
        error: 'Booking time is valid'
    };
}