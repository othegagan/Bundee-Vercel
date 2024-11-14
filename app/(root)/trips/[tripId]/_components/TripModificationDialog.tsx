'use client';

import TimeSelect from '@/components/custom/TimeSelect';
import { PriceCalculatedListSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody } from '@/components/ui/dialog';
import useTripModificationDialog from '@/hooks/dialogHooks/useTripModificationDialog';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { validateBookingTime } from '@/hooks/useVehicleDetails';
import { convertToCarDate, convertToCarTimeZoneISO, determineDeliveryType, formatDateAndTime, formatTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { ModificationIcon } from '@/public/icons';
import { calculatePrice } from '@/server/priceCalculation';
import { differenceInHours, format, isBefore, isEqual, isWithinInterval, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { TripModificationEndDateCalendar, TripModificationStartDateCalendar } from './TripModificationCalendars';
import TripModificationCardChangeComponent from './TripModificationCardChangeComponent';
import TripModificationPriceListComponent from './TripModificationPriceListComponent';
import TripModificationResult from './TripModificationResult';

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

    const { isAirportDeliveryChoosen, isCustomDeliveryChoosen } = determineDeliveryType(tripData);

    const {
        isLoading: unavailabilitDatesLoading,
        isError,
        unavailableDates,
        unformattedDates,
        minDays,
        maxDays
    } = useAvailabilityDates(tripData.vehicleId, tripData.reservationid, tripData?.vehzipcode);

    const [dateSelectionError, setDateSelectionError] = useState('');

    // Initialization
    useEffect(() => {
        setNewStartDate(formatDateAndTime(tripData.starttime, tripData?.vehzipcode, 'default'));
        setNewEndDate(formatDateAndTime(tripData.endtime, tripData?.vehzipcode, 'default'));
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

            // check for short notice late night reservation
            const { isValid, error } = validateBookingTime(`${newStartDate}T${newStartTime}`);

            if (!isValid) {
                throw new Error(error);
            }

            // Check for any unavailable dates within the new date range
            const unAvailabilityDates = unformattedDates?.map((date) => parseISO(date));

            const hasUnavailableDate = unAvailabilityDates?.some((date) => isWithinInterval(date, { start: parsedNewStartDate, end: parsedNewEndDate }));

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
                startTime: convertToCarTimeZoneISO(`${newStartDate}T${newStartTime}`, tripData.vehzipcode),
                endTime: convertToCarTimeZoneISO(`${newEndDate}T${newEndTime}`, tripData.vehzipcode),
                airportDelivery: isAirportDeliveryChoosen,
                customDelivery: isCustomDeliveryChoosen,
                hostid: tripData.hostid,
                tripid: tripData.tripid
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
        // tripModificationModal.onClose();
        // setIsExtension(false);
        // setPriceCalculatedList(null);
        // setPriceError('');
        // setPriceLoading(false);
        // setDateSelectionError('');
        // setIsInitialLoad(true);
        // setNewStartDate(formatDateAndTime(tripData.starttime, tripData?.vehzipcode, 'default'));
        // setNewEndDate(formatDateAndTime(tripData.endtime, tripData?.vehzipcode, 'default'));
        // setNewStartTime(formatTime(tripData.starttime, tripData?.vehzipcode));
        // setNewEndTime(formatTime(tripData.endtime, tripData?.vehzipcode));
        // if (submitted) {
        // }
        window.location.reload();
    }

    return (
        <div>
            <Button onClick={openModifiyDialog} variant='link' className='flex items-center gap-2 px-0 font-semibold text-secondary-foreground'>
                <ModificationIcon className='size-5' />
                Modify Trip
            </Button>

            <Dialog
                isOpen={tripModificationModal.isOpen}
                closeDialog={closeModifyDialog}
                onInteractOutside={false}
                className={`${tripModificationModal.submitted ? 'lg:max-w-2xl' : 'lg:max-w-[1330px] lg:p-8 lg:px-10'}`}
                title={tripModificationModal.submitted ? '' : 'Modify Trip Date Time'}>
                {!tripModificationModal.submitted ? (
                    <DialogBody className='-mt-2 overflow-auto'>
                        <div className='mb-2 flex w-full flex-col-reverse items-start gap-4 lg:flex-row lg:justify-between'>
                            <div className='space-y-1'>
                                <p className='text-16'>Please select new dates and times for the trip below</p>
                                <p className='flex items-center gap-2 text-14 text-neutral-500'>
                                    {' '}
                                    <IoInformationCircleOutline />
                                    Selecting new dates may change the total trip cost.
                                </p>
                            </div>
                        </div>
                        <div className='mt-4 grid grid-cols-1 gap-4 md:gap-7 lg:grid-cols-3'>
                            <div>
                                <div className='space-y-3'>
                                    <p className='font-semibold text-14'>Current Trip Summary</p>
                                    <div className='flex flex-col items-center justify-center gap-4 rounded-lg bg-[#FAF7F7] p-2 '>
                                        <div className='flex w-full justify-between gap-2 '>
                                            <p className='text-center text-14'>
                                                {splitFormattedDateAndTime(formatDateAndTime(tripData.starttime, tripData.vehzipcode))}
                                            </p>
                                            <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                                            <p className='text-center text-14'>
                                                {splitFormattedDateAndTime(formatDateAndTime(tripData.endtime, tripData.vehzipcode))}
                                            </p>
                                        </div>
                                        <div className='text-14 '>
                                            Trip duration: {tripData.tripPaymentTokens[0]?.totaldays}
                                            {tripData?.tripPaymentTokens[0]?.totaldays === 1 ? 'Day' : 'Days'}
                                        </div>

                                        <div className='flex w-full items-center justify-between border-black/40 border-t px-2 pt-2'>
                                            <p className='font-bold text-14'>Total Rental Charges</p>
                                            <p className='font-bold text-14'>${roundToTwoDecimalPlaces(tripData?.tripPaymentTokens[0]?.tripTaxAmount)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-6 flex w-full flex-col gap-5 text-sm'>
                                    <div className=' flex items-center gap-3 p-1'>
                                        <div className='flex w-full flex-1 flex-col gap-2'>
                                            <label className='font-semibold text-14'>New Start Date</label>
                                            <TripModificationStartDateCalendar
                                                unavailableDates={unavailableDates}
                                                isTripStarted={tripData.status.toLowerCase() === 'started'}
                                                date={newStartDate}
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
                                    <div className=' flex items-center gap-3 p-1'>
                                        <div className='flex w-full flex-1 flex-col gap-2'>
                                            <label className='font-semibold text-14'>New End Date</label>
                                            <TripModificationEndDateCalendar
                                                unavailableDates={unavailableDates}
                                                date={newEndDate}
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
                                            <p className='font-normal text-destructive text-xs'>{dateSelectionError || priceError}</p>
                                        </div>
                                    ))}
                            </div>

                            <div>
                                {!priceError ? (
                                    <div>
                                        {priceLoading ? (
                                            <div className='mt-4 text-center'>
                                                <PriceCalculatedListSkeleton />
                                            </div>
                                        ) : (
                                            <div>
                                                {priceCalculatedList && !dateSelectionError && (
                                                    <TripModificationPriceListComponent
                                                        pricelist={priceCalculatedList}
                                                        newStartDate={newStartDate}
                                                        newEndDate={newEndDate}
                                                        newStartTime={newStartTime}
                                                        newEndTime={newEndTime}
                                                        zipCode={tripData?.vehzipcode}
                                                        originalTripTaxAmount={tripData?.tripPaymentTokens[0]?.tripTaxAmount}
                                                        isExtension={isExtension}
                                                        isAirportDeliveryChoosen={isAirportDeliveryChoosen}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            <div className='flex flex-col gap-4 '>
                                <TripModificationCardChangeComponent
                                    tripId={tripData.tripid}
                                    closeModifyDialog={closeModifyDialog}
                                    newEndDate={newEndDate}
                                    newEndTime={newEndTime}
                                    newStartDate={newStartDate}
                                    newStartTime={newStartTime}
                                    type={isExtension ? 'extension' : 'reduction'}
                                    priceLoading={priceLoading}
                                    dateSelectionError={dateSelectionError}
                                    priceError={priceError}
                                    priceCalculatedList={priceCalculatedList}
                                    vehzipcode={tripData.vehzipcode}
                                />
                            </div>
                        </div>
                    </DialogBody>
                ) : (
                    <TripModificationResult success={tripModificationModal.success} onClose={closeModifyDialog} message={tripModificationModal.message} />
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
        <div>
            {datePart}
            <br />
            {timePart}
        </div>
    );
}
