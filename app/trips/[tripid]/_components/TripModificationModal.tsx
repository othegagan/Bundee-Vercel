'use client';
import TimeSelect from '@/components/custom/TimeSelect';
import { PriceCalculatedListSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import useTripModificationModal from '@/hooks/useTripModificationModal';
import { getSession } from '@/lib/auth';
import { convertToCarTimeZoneISO, formatDateTimeWithWeek, formatTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { createTripExtension, createTripReduction } from '@/server/checkout';
import { calculatePrice } from '@/server/priceCalculation';
import { differenceInHours, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { StatusBadge } from '../../TripsComponent';
import { TripModificationCalendar } from './TripModificationCalendar';
import TripModificationPriceListComponent from './TripModificationPriceListComponent';

const useTripModification = () => {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const createPayloadForCheckout = (
        type: string,
        userId: number,
        tripData: any,
        newStartDate: string,
        newEndDate: string,
        newStartTime: string,
        newEndTime: string,
        priceCalculatedList: any,
    ) => {
        const bookingDetails = {
            tripid: tripData.tripid,
            userId: String(userId),
            startTime: convertToCarTimeZoneISO(newStartDate, newStartTime, tripData.vehzipcode),
            endTime: convertToCarTimeZoneISO(newEndDate, newEndTime, tripData.vehzipcode),
            pickupTime: newStartTime,
            dropTime: newEndTime,
            totalDays: String(priceCalculatedList.numberOfDays),
            taxAmount: priceCalculatedList.taxAmount,
            tripTaxAmount: priceCalculatedList.tripTaxAmount,
            totalamount: priceCalculatedList.totalAmount,
            tripamount: String(priceCalculatedList.tripAmount),
            upCharges: priceCalculatedList.upcharges,
            deliveryCost: priceCalculatedList.delivery,
            perDayAmount: priceCalculatedList.pricePerDay,
            extreaMilageCost: 0,
            isPaymentChanged: true,
            Statesurchargeamount: priceCalculatedList.stateSurchargeAmount,
            Statesurchargetax: priceCalculatedList.stateSurchargeTax,
            ...priceCalculatedList,
            taxPercentage: priceCalculatedList.taxPercentage * 100,
        };

        if (type === 'reduction') {
            bookingDetails.paymentauthorizationconfigid = 1;
            bookingDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            bookingDetails.authorizationamount = priceCalculatedList.authAmount;
            bookingDetails.comments = '';
        } else if (type === 'extension') {
            bookingDetails.deductionfrequencyconfigid = 1;
            bookingDetails.paymentauthorizationconfigid = 1;
            bookingDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            bookingDetails.authorizationamount = priceCalculatedList.authAmount;
            bookingDetails.comments = '';
        }

        const fieldsToRemove = [
            'authAmount',
            'authPercentage',
            'delivery',
            'hostPriceMap',
            'numberOfDays',
            'pricePerDay',
            'stateSurchargeAmount',
            'stateSurchargeTax',
            'totalAmount',
            'tripAmount',
            'upcharges',
        ];

        fieldsToRemove.forEach(field => delete bookingDetails[field]);

        return bookingDetails;
    };

    const handleTripModification = async (
        type: string,
        tripData: any,
        newStartDate: string,
        newEndDate: string,
        newStartTime: string,
        newEndTime: string,
        priceCalculatedList: any,
    ) => {
        try {
            setSubmitting(true);
            const session = await getSession();
            const payload = createPayloadForCheckout(type, session.userId, tripData, newStartDate, newEndDate, newStartTime, newEndTime, priceCalculatedList);
            const response = type === 'reduction' ? await createTripReduction(payload) : await createTripExtension(payload);

            console.log(`Trip ${type === 'reduction' ? 'Reduction' : 'Extension'} Response`, response);

            if (response.success) {
                setSuccess(true);
            } else {
                setSuccess(false);
            }
        } catch (error) {
            console.error(error);
            setSuccess(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReduction = (tripData: any, newStartDate: any, newEndDate: any, newStartTime: any, newEndTime: any, priceCalculatedList: any) =>
        handleTripModification('reduction', tripData, newStartDate, newEndDate, newStartTime, newEndTime, priceCalculatedList);

    const handleExtension = (tripData: any, newStartDate: any, newEndDate: any, newStartTime: any, newEndTime: any, priceCalculatedList: any) =>
        handleTripModification('extension', tripData, newStartDate, newEndDate, newStartTime, newEndTime, priceCalculatedList);

    return {
        submitting,
        success,
        handleReduction,
        handleExtension,
    };
};

export default function TripModificationDialog({ tripData }) {
    const tripModificationModal = useTripModificationModal();

    const [newStartDate, setNewStartDate] = useState(null);
    const [newEndDate, setNewEndDate] = useState(null);

    const [newStartTime, setNewStartTime] = useState('10:00:00');
    const [newEndTime, setNewEndTime] = useState('10:00:00');

    const [isExtension, setIsExtension] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);

    const [priceLoading, setPriceLoading] = useState(false);
    const [priceCalculatedList, setPriceCalculatedList] = useState(null);
    const [priceError, setPriceError] = useState('');

    const { submitting, handleReduction, handleExtension, success } = useTripModification();

    const { isLoading, isError, unavailableDates } = useAvailabilityDates(tripData.vehicleId, tripData.tripid);

    const [dateSelectionError, setDateSelectionError] = useState('');

    // Initialization
    useEffect(() => {
        setNewStartDate(format(new Date(tripData.starttime), 'yyyy-MM-dd'));
        setNewEndDate(format(new Date(tripData.endtime), 'yyyy-MM-dd'));
        setNewStartTime(formatTime(tripData.starttime, tripData?.vehzipcode));
        setNewEndTime(formatTime(tripData.endtime, tripData?.vehzipcode));
    }, [tripData]);

    // Price Calculation
    useEffect(() => {
        if (!isInitialLoad && newStartDate && newEndDate) {
            getPriceCalculation();
        } else {
            setIsInitialLoad(true);
        }
    }, [newStartDate, newEndDate, isInitialLoad]);

    async function getPriceCalculation() {
        try {
            console.log(newStartDate, newEndDate);
            console.log(newStartTime, newEndTime);
            let originalDiff = differenceInHours(new Date(tripData.endtime), new Date(tripData.starttime));
            let newDiff = differenceInHours(new Date(newEndDate + 'T' + newEndTime), new Date(newStartDate + 'T' + newEndTime));

            console.log('originalDiff', originalDiff, 'newDiff', newDiff);
            if (originalDiff < newDiff) {
                setIsExtension(true);
            } else {
                setIsExtension(false);
            }

            setPriceError('');
            setPriceLoading(true);
            setPriceCalculatedList(null);

            const payload: any = {
                vehicleid: tripData.vehicleId,
                startTime: convertToCarTimeZoneISO(newStartDate, newStartTime, tripData.vehzipcode),
                endTime: convertToCarTimeZoneISO(newEndDate, newEndTime, tripData.vehzipcode),
                airportDelivery: tripData.airportDelivery,
                customDelivery: tripData.delivery,
                hostid: tripData.hostid,
            };

            const responseData: any = await calculatePrice(payload);

            if (responseData.success) {
                const data = responseData.data;
                setPriceCalculatedList(data.priceCalculatedList?.[0]);
            } else {
                setPriceError(responseData.message);
            }
        } catch (error) {
            console.log(error);
            setPriceError(error.message);
        } finally {
            setPriceLoading(false);
        }
    }

    function openModifiyDialog() {
        tripModificationModal.onOpen();
    }

    function closeModifyDialog() {
        tripModificationModal.onClose();
        setIsExtension(false);
        setPriceCalculatedList(null);
        setPriceError('');
        setPriceLoading(false);
    }

    function handleSubmit() {
        if (isExtension) {
            handleExtension(tripData, newStartDate, newEndDate, newStartTime, newEndTime, priceCalculatedList);
        } else {
            handleReduction(tripData, newStartDate, newEndDate, newStartTime, newEndTime, priceCalculatedList);
        }
    }

    return (
        <div>
            <Button onClick={openModifiyDialog} variant='black' className='w-full' size='lg'>
                Modify trip
            </Button>

            <Dialog
                isOpen={tripModificationModal.isOpen}
                closeDialog={closeModifyDialog}
                onInteractOutside={false}
                className='md:max-w-3xl lg:max-w-4xl'
                title='Modify Booking Date Time'
                description='Selecting new dates will change the total booking charges.'>
                <DialogBody>
                    <div className='mb-2 flex w-full flex-col-reverse items-start gap-2 lg:flex-row lg:justify-between'>
                        <p className='text-14 '>Please select new dates and times for your trip below.</p>
                        <div className='text-14 font-semibold'>
                            Booking Status : <StatusBadge status={tripData.status} type='booking' />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8'>
                        <div>
                            <div className='space-y-3'>
                                <p className='text-14 font-semibold'>Current Booking Summary</p>
                                <div className='flex flex-col items-center justify-center gap-4 rounded-sm bg-[#FAF7F7] p-2.5 '>
                                    <div className='flex w-full justify-between gap-2 px-2'>
                                        <p className='text-14 text-center'>
                                            {splitFormattedDateAndTime(formatDateTimeWithWeek(tripData.starttime, tripData.vehzipcode))}
                                        </p>
                                        <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                                        <p className='text-14 text-center'>
                                            {splitFormattedDateAndTime(formatDateTimeWithWeek(tripData.endtime, tripData.vehzipcode))}
                                        </p>
                                    </div>
                                    <div className='text-14 '>
                                        Booking duration: {tripData.tripPaymentTokens[0]?.totaldays}{' '}
                                        {tripData?.tripPaymentTokens[0]?.totaldays == 1 ? 'Day' : 'Days'}
                                    </div>

                                    <div className='flex w-full items-center justify-between border-t border-black/40 px-2 pt-2'>
                                        <p className='text-14 font-bold'>Total Rental Charges</p>
                                        <p className='text-14 font-bold'>${roundToTwoDecimalPlaces(tripData?.tripPaymentTokens[0].tripTaxAmount)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-6 flex w-full flex-col gap-5 text-sm'>
                                <div className=' flex w-full items-center justify-between gap-3'>
                                    <div className='flex w-full flex-1 flex-col gap-2'>
                                        <label className='text-14 font-semibold'>New Start Date</label>
                                        <TripModificationCalendar
                                            unavailableDates={unavailableDates}
                                            newStartDate={newStartDate}
                                            setNewStartDate={setNewStartDate}
                                            isTripStarted={tripData.status.toLowerCase() === 'started'}
                                        />
                                    </div>

                                    <TimeSelect
                                        label='New Start Time'
                                        defaultValue={formatTime(tripData.starttime, tripData?.vehzipcode)}
                                        onChange={time => {
                                            setNewStartTime(time);
                                            getPriceCalculation();
                                        }}
                                    />
                                </div>
                                <div className=' flex items-center justify-between gap-3'>
                                    <div className='flex w-full flex-1 flex-col gap-2'>
                                        <label className='text-14 font-semibold'>New End Date</label>
                                        {/* <TripModificationCalendar
                                            unavailableDates={unavailableDates}
                                            newStartDate={newStartDate}
                                            setNewStartDate={setNewStartDate}
                                            isTripStarted={tripData.status.toLowerCase() === 'started'}
                                        /> */}
                                    </div>
                                    <TimeSelect
                                        label='New End Time'
                                        defaultValue={formatTime(tripData.endtime, tripData?.vehzipcode)}
                                        onChange={time => {
                                            setNewEndTime(time);
                                            getPriceCalculation();
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {!priceError && (
                            <>
                                {priceLoading ? (
                                    <div className='mt-4 text-center'>
                                        <PriceCalculatedListSkeleton />
                                    </div>
                                ) : (
                                    <>
                                        {priceCalculatedList && (
                                            <TripModificationPriceListComponent
                                                priceCalculatedList={priceCalculatedList}
                                                newStartDate={newStartDate}
                                                newEndDate={newEndDate}
                                                newStartTime={newStartTime}
                                                newEndTime={newEndTime}
                                                zipCode={tripData?.vehzipcode}
                                                originalTripTaxAmount={tripData?.tripPaymentTokens[0]?.tripTaxAmount}
                                                isExtension={isExtension}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button type='button' onClick={closeModifyDialog} variant='outline'>
                        Keep Current & Close
                    </Button>
                    <Button
                        type='button'
                        disabled={priceLoading || !priceCalculatedList || Boolean(priceError)}
                        className={`bg-primary ${dateSelectionError || priceLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export function splitFormattedDateAndTime(input: string) {
    const parts = input.split(' | ');
    if (parts.length !== 2) {
        throw new Error('Invalid input format');
    }
    const [datePart, timePart] = parts;
    return (
        <>
            {datePart}
            <br />
            {timePart}
        </>
    );
}
