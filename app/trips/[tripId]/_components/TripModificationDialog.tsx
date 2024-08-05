'use client';

import TimeSelect from '@/components/custom/TimeSelect';
import { PriceCalculatedListSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import useTripModificationDialog from '@/hooks/dialogHooks/useTripModificationDialog';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { getSession } from '@/lib/auth';
import { convertToCarDate, convertToCarTimeZoneISO, formatDateAndTime, formatTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { createTripExtension, createTripReduction } from '@/server/checkout';
import { calculatePrice } from '@/server/priceCalculation';
import { differenceInHours, format, isBefore, isEqual, isWithinInterval, parseISO } from 'date-fns';
import { CircleCheck, CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { TripModificationEndDateCalendar, TripModificationStartDateCalendar } from './TripModificationCalendars';
import TripModificationPriceListComponent from './TripModificationPriceListComponent';

const useTripModification = () => {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
        const tripDetails = {
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
        };

        if (type === 'reduction') {
            tripDetails.paymentauthorizationconfigid = 1;
            tripDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            tripDetails.authorizationamount = priceCalculatedList.authAmount;
            tripDetails.comments = '';
        } else if (type === 'extension') {
            tripDetails.deductionfrequencyconfigid = 1;
            tripDetails.paymentauthorizationconfigid = 1;
            tripDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            tripDetails.authorizationamount = priceCalculatedList.authAmount;
            tripDetails.comments = '';
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

        fieldsToRemove.forEach((field) => delete tripDetails[field]);

        return tripDetails;
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

            // console.log(payload);

            const response = type === 'reduction' ? await createTripReduction(payload) : await createTripExtension(payload);

            // console.log(`Trip ${type === 'reduction' ? 'Reduction' : 'Extension'} Response`, response);

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
            setSubmitted(true);
        }
    };

    const handleReduction = (tripData: any, newStartDate: any, newEndDate: any, newStartTime: any, newEndTime: any, priceCalculatedList: any) =>
        handleTripModification('reduction', tripData, newStartDate, newEndDate, newStartTime, newEndTime, priceCalculatedList);

    const handleExtension = (tripData: any, newStartDate: any, newEndDate: any, newStartTime: any, newEndTime: any, priceCalculatedList: any) =>
        handleTripModification('extension', tripData, newStartDate, newEndDate, newStartTime, newEndTime, priceCalculatedList);

    return {
        submitting,
        submitted,
        success,
        handleReduction,
        handleExtension,
    };
};

export default function TripModificationDialog({ tripData }) {
    const tripModificationModal = useTripModificationDialog();

    const [newStartDate, setNewStartDate] = useState(null);
    const [newEndDate, setNewEndDate] = useState(null);

    const [newStartTime, setNewStartTime] = useState('10:00:00');
    const [newEndTime, setNewEndTime] = useState('10:00:00');

    const [isExtension, setIsExtension] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);

    const [priceLoading, setPriceLoading] = useState(false);
    const [priceCalculatedList, setPriceCalculatedList] = useState(null);
    const [priceError, setPriceError] = useState('');

    const { submitting, submitted, handleReduction, handleExtension, success } = useTripModification();

    const {
        isLoading: unavailabilitDatesLoading,
        isError,
        unavailableDates,
        unformattedDates,
        minDays,
        maxDays,
    } = useAvailabilityDates(tripData.vehicleId, tripData.tripid);

    const [dateSelectionError, setDateSelectionError] = useState('');

    // Initialization
    useEffect(() => {
        setNewStartDate(format(convertToCarDate(tripData.starttime, tripData?.vehzipcode), 'yyyy-MM-dd'));
        setNewEndDate(format(convertToCarDate(tripData.endtime, tripData?.vehzipcode), 'yyyy-MM-dd'));
        setNewStartTime(formatTime(tripData.starttime, tripData?.vehzipcode));
        setNewEndTime(formatTime(tripData.endtime, tripData?.vehzipcode));
    }, []);

    // Price Calculation
    useEffect(() => {
        if (!isInitialLoad && newStartDate && newEndDate && newStartTime && newEndTime) {
            getPriceCalculation();
        } else {
            setIsInitialLoad(true);
        }
    }, [newStartDate, newEndDate, newStartTime, newEndTime, isInitialLoad]);

    async function getPriceCalculation() {
        try {
            const originalStartDateTime = `${format(convertToCarDate(tripData.starttime, tripData?.vehzipcode), 'yyyy-MM-dd')}T${formatTime(tripData.starttime, tripData?.vehzipcode)}`;
            const originalEndDateTime = `${format(convertToCarDate(tripData.endtime, tripData?.vehzipcode), 'yyyy-MM-dd')}T${formatTime(tripData.endtime, tripData?.vehzipcode)}`;
            const parsedOriginalStartDate = parseISO(originalStartDateTime);
            const parsedOriginalEndDate = parseISO(originalEndDateTime);
            const parsedNewStartDate = parseISO(`${newStartDate}T${newStartTime}`);
            const parsedNewEndDate = parseISO(`${newEndDate}T${newEndTime}`);

            // check if the new start date and end date are not as same as the original start and end date
            if (isEqual(parsedNewStartDate, parsedOriginalStartDate) && isEqual(parsedNewEndDate, parsedOriginalEndDate)) {
                throw new Error('Please select a new start and end date that are different from the original start and end date.');
            }

            // Check if the new start date is not before the new end date
            if (!isBefore(parsedNewStartDate, parsedNewEndDate)) {
                throw new Error('Please select an end date that comes after the start date.');
            }

            // Check for any unavailable dates within the new date range
            const unAvailabilityDates = unformattedDates.map((date) => parseISO(date));

            const hasUnavailableDate = unAvailabilityDates.some((date) => isWithinInterval(date, { start: parsedNewStartDate, end: parsedNewEndDate }));

            if (hasUnavailableDate) {
                throw new Error('Some dates are unavailable. Please adjust your selection.');
            }

            const originalDiff = differenceInHours(parsedOriginalEndDate, parsedOriginalStartDate);
            const newDiff = differenceInHours(parsedNewEndDate, parsedNewStartDate);

            if (newDiff > originalDiff) {
                setIsExtension(true);
            } else {
                setIsExtension(false);
            }

            setPriceError('');
            setPriceLoading(true);
            setPriceCalculatedList(null);

            const payload = {
                vehicleid: tripData.vehicleId,
                startTime: convertToCarTimeZoneISO(newStartDate, newStartTime, tripData.vehzipcode),
                endTime: convertToCarTimeZoneISO(newEndDate, newEndTime, tripData.vehzipcode),
                airportDelivery: tripData.airportDelivery,
                customDelivery: tripData.delivery,
                hostid: tripData.hostid,
            };

            // console.log(payload);
            const responseData = await calculatePrice(payload);

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
        setDateSelectionError('');
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
            <Button onClick={openModifiyDialog} variant='link' className='px-0 flex items-center gap-2 text-secondary-foreground font-semibold'>
                <img src='/icons/edit_document.svg' alt='edit' width={18} height={18} />
                Modify Trip
            </Button>

            <Dialog
                isOpen={tripModificationModal.isOpen}
                closeDialog={closeModifyDialog}
                onInteractOutside={false}
                className={` ${submitted ? 'lg:max-w-2xl' : 'md:max-w-3xl lg:max-w-6xl lg:p-8 lg:px-10'}`}
                title={submitted ? '' : 'Modify Trip Date Time'}
                description={!submitted ? '' : ''}>
                {!submitted ? (
                    <>
                        <DialogBody>
                            <div className='mb-2 flex w-full flex-col-reverse items-start gap-4 lg:flex-row lg:justify-between'>
                                <div className='space-y-1'>
                                    <p className='text-16'>Please select new dates and times for the trip below</p>
                                    <p className='text-14 flex items-center gap-2 text-neutral-500'>
                                        {' '}
                                        <IoInformationCircleOutline />
                                        Selecting new dates may change the total trip cost.
                                    </p>
                                </div>
                            </div>
                            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-10'>
                                <div>
                                    <div className='space-y-3'>
                                        <p className='text-14 font-semibold'>Current Trip Summary</p>
                                        <div className='flex flex-col items-center justify-center gap-4 rounded-lg bg-[#FAF7F7] p-2 '>
                                            <div className='flex w-full justify-between gap-2 '>
                                                <p className='text-14 text-center'>
                                                    {splitFormattedDateAndTime(formatDateAndTime(tripData.starttime, tripData.vehzipcode))}
                                                </p>
                                                <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                                                <p className='text-14 text-center'>
                                                    {splitFormattedDateAndTime(formatDateAndTime(tripData.endtime, tripData.vehzipcode))}
                                                </p>
                                            </div>
                                            <div className='text-14 '>
                                                Trip duration: {tripData.tripPaymentTokens[0]?.totaldays}
                                                {tripData?.tripPaymentTokens[0]?.totaldays === 1 ? 'Day' : 'Days'}
                                            </div>

                                            <div className='flex w-full items-center justify-between border-t border-black/40 px-2 pt-2'>
                                                <p className='text-14 font-bold'>Total Rental Charges</p>
                                                <p className='text-14 font-bold'>${roundToTwoDecimalPlaces(tripData?.tripPaymentTokens[0].tripTaxAmount)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='mt-6 flex w-full flex-col gap-5 text-sm'>
                                        <div className=' grid grid-cols-2 gap-3 p-1'>
                                            <div className='flex w-full flex-1 flex-col gap-2'>
                                                <label className='text-14 font-semibold'>New Start Date</label>
                                                <TripModificationStartDateCalendar
                                                    unavailableDates={unavailableDates}
                                                    isTripStarted={tripData.status.toLowerCase() === 'started'}
                                                    date={convertToCarDate(tripData.starttime, tripData?.vehzipcode)}
                                                    setDate={setNewStartDate}
                                                    setIsInitialLoad={setIsInitialLoad}
                                                    isDisabled={tripData.status.toLowerCase() === 'started'}
                                                    setDateSelectionError={setDateSelectionError}
                                                />
                                            </div>

                                            <TimeSelect
                                                label='New Start Time'
                                                isDisabled={tripData.status.toLowerCase() === 'started'}
                                                defaultValue={formatTime(tripData.starttime, tripData?.vehzipcode)}
                                                onChange={(time) => {
                                                    setNewStartTime(time);
                                                    setIsInitialLoad(false);
                                                }}
                                            />
                                        </div>
                                        <div className=' grid grid-cols-2 gap-3 p-1'>
                                            <div className='flex w-full flex-1 flex-col gap-2'>
                                                <label className='text-14 font-semibold'>New End Date</label>
                                                <TripModificationEndDateCalendar
                                                    unavailableDates={unavailableDates}
                                                    date={convertToCarDate(tripData.endtime, tripData?.vehzipcode)}
                                                    setDate={setNewEndDate}
                                                    isTripStarted={tripData.status.toLowerCase() === 'started'}
                                                    setIsInitialLoad={setIsInitialLoad}
                                                    isDisabled={false}
                                                    setDateSelectionError={setDateSelectionError}
                                                    newStartDate={newStartDate}
                                                />
                                            </div>
                                            <TimeSelect
                                                label='New End Time'
                                                defaultValue={formatTime(tripData.endtime, tripData?.vehzipcode)}
                                                onChange={(time) => {
                                                    setNewEndTime(time);
                                                    setIsInitialLoad(false);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {dateSelectionError ||
                                        (priceError && (
                                            <div className='mt-2 flex gap-2'>
                                                <IoInformationCircleOutline className='text-destructive' />
                                                <p className='text-xs font-normal text-destructive'>{dateSelectionError || priceError}</p>
                                            </div>
                                        ))}
                                </div>

                                {!priceError ? (
                                    <div>
                                        {priceLoading ? (
                                            <div className='mt-4 text-center'>
                                                <PriceCalculatedListSkeleton />
                                            </div>
                                        ) : (
                                            <>
                                                {priceCalculatedList && !dateSelectionError && (
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
                                    </div>
                                ) : null}
                            </div>
                        </DialogBody>
                        <DialogFooter>
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
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        {success ? (
                            <>
                                <DialogBody>
                                    <div className='grid grid-cols-1 place-items-center space-y-4'>
                                        <CircleCheck className='size-20 text-green-500' />
                                        <h3 className=' text-center'>Trip modification submitted</h3>
                                        <p className='text-lg'>Enjoy your journey with us!</p>

                                        <Button
                                            className='mt-2'
                                            type='button'
                                            onClick={() => {
                                                closeModifyDialog();
                                                window.location.reload();
                                            }}
                                            variant='outline'>
                                            Return To Trip
                                        </Button>
                                    </div>
                                </DialogBody>
                            </>
                        ) : (
                            <>
                                <DialogBody>
                                    <div className='grid grid-cols-1 place-items-center space-y-4'>
                                        <CircleX className='size-20 text-red-500' />
                                        <h3 className=' text-center'>Trip modification failed</h3>
                                        {/* <p className='text-lg'>Enjoy your journey with us!</p> */}

                                        <Button
                                            className='mt-2'
                                            type='button'
                                            onClick={() => {
                                                closeModifyDialog();
                                                window.location.reload();
                                            }}
                                            variant='outline'>
                                            Return To Trip
                                        </Button>
                                    </div>
                                </DialogBody>
                            </>
                        )}
                    </>
                )}
            </Dialog>
        </div>
    );
}

export function splitFormattedDateAndTime(input: string) {
    const parts = input.split(' | ');
    if (parts.length !== 2) {
        return input;
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
