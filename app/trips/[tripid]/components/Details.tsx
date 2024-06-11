'use client';
import { Modal, ModalBody, ModalHeader } from '@/components/custom/modal';
import TimeSelect from '@/components/custom/TimeSelect';
import { CalendarSelectSkeleton, PriceCalculatedListSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import useTripReviewModal from '@/hooks/useTripReviewModal';
import { calculatePrice } from '@/server/priceCalculation';
import { startTripByDriver } from '@/server/userOperations';
import { differenceInHours, format } from 'date-fns';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import CancelTripComponent from './CancelTripComponent';
import FreeCancellationDate from './FreeCancellationDate';
import ModificationCalendarComponent from './ModificationCalendarComponent';
import SwapComponent from './SwapComponent';
import TripImageVideoUploadComponent from './TripImageVideoUploadComponent';
import TripModificationPriceListComponent from './TripModificationPriceListComponent';
import TripPriceListComponent from './TripPriceListComponent';
import TripVehicleDetailsComponent from './TripVehicleDetailsComponent';
import { getSession } from '@/lib/auth';
import { convertToCarDate, convertToCarTimeZoneISO, formatDateAndTime, formatTime, toTitleCase } from '@/lib/utils';
import useRentalAgreementModal from '@/hooks/useRentalAgreement';
import { Download } from 'lucide-react';
import StartTripComponent from './StartTripComponent';
import { createTripExtension, createTripReduction } from '@/server/checkout';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Details({ tripsData, tripRating }: any) {
    const tripReviewModal = useTripReviewModal();
    const rentalAgreementModal = useRentalAgreementModal();

    const [modifyCalenderOpen, setModifyCalenderOpen] = useState(false);
    const [swapRequestDetails, setSwapRequestDetails] = useState(null);

    const [error, setError] = useState('');

    const [priceLoading, setPriceLoading] = useState(false);
    const [priceCalculatedList, setPriceCalculatedList] = useState(null);
    const [deductionConfigData, setDeductionConfigData] = useState(null);

    const [newStartDate, setNewStartDate] = useState(null);
    const [newEndDate, setNewEndDate] = useState(null);

    const [newStartTime, setNewStartTime] = useState('10:00:00');
    const [newEndTime, setNewEndTime] = useState('10:00:00');

    const [isExtension, setIsExtension] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [comments, setComments] = useState('');

    useEffect(() => {
        setNewStartDate(format(new Date(tripsData.starttime), 'yyyy-MM-dd'));
        setNewEndDate(format(new Date(tripsData.endtime), 'yyyy-MM-dd'));
        setNewStartTime(formatTime(tripsData.starttime, tripsData?.vehzipcode));
        setNewEndTime(formatTime(tripsData.endtime, tripsData?.vehzipcode));
        setSwapRequestDetails(tripsData.swapDetails[0]);
    }, [tripsData]);

    useEffect(() => {
        if (!isInitialLoad && newStartDate && newEndDate) {
            getPriceCalculation();
        } else {
            setIsInitialLoad(true);
        }
    }, [newStartDate, newEndDate, isInitialLoad]);

    async function getPriceCalculation() {
        try {
            const originalDiff = differenceInHours(new Date(tripsData.endtime), new Date(tripsData.starttime));
            const newDiff = differenceInHours(new Date(newEndDate + 'T' + newEndTime), new Date(newStartDate + 'T' + newEndTime));

            if (originalDiff < newDiff) {
                setIsExtension(true);
            } else {
                setIsExtension(false);
            }

            setError('');
            setPriceLoading(true);
            setPriceCalculatedList(null);

            const payload: any = {
                vehicleid: tripsData.vehicleId,
                startTime: convertToCarTimeZoneISO(newStartDate, newStartTime, tripsData.vehzipcode),
                endTime: convertToCarTimeZoneISO(newEndDate, newEndTime, tripsData.vehzipcode),
                airportDelivery: tripsData.airportDelivery,
                customDelivery: tripsData.delivery,
                hostid: tripsData.hostid,
            };

            const responseData: any = await calculatePrice(payload);

            if (responseData.success) {
                const data = responseData.data;
                setPriceCalculatedList(data.priceCalculatedList?.[0]);
                setDeductionConfigData(data.deductionDetails?.[0]);
            } else {
                setError(responseData.message);
            }
        } catch (error) {
            console.log(error);
            setError(error.message);
        } finally {
            setPriceLoading(false);
        }
    }

    const createPayloadForCheckout = (type: string, userId: number) => {
        const bookingDetails = {
            tripid: tripsData.tripid,
            userId: String(userId),
            startTime: convertToCarTimeZoneISO(newStartDate, newStartTime, tripsData.vehzipcode),
            endTime: convertToCarTimeZoneISO(newEndDate, newEndTime, tripsData.vehzipcode),
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
            bookingDetails.paymentauthorizationconfigid = deductionConfigData.authorizationConfigId || 1;
            bookingDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            bookingDetails.authorizationamount = priceCalculatedList.authAmount;
            bookingDetails.comments = comments || '';
        } else if (type === 'extension') {
            bookingDetails.deductionfrequencyconfigid = deductionConfigData.deductioneventconfigid || 1;
            bookingDetails.paymentauthorizationconfigid = deductionConfigData.authorizationConfigId || 1;
            bookingDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            bookingDetails.authorizationamount = priceCalculatedList.authAmount;
            bookingDetails.comments = comments || '';
        }

        delete bookingDetails.authAmount;
        delete bookingDetails.authPercentage;
        delete bookingDetails.delivery;
        delete bookingDetails.hostPriceMap;
        delete bookingDetails.authAmount;
        delete bookingDetails.numberOfDays;
        delete bookingDetails.pricePerDay;
        delete bookingDetails.stateSurchargeAmount;
        delete bookingDetails.stateSurchargeTax;
        delete bookingDetails.totalAmount;
        delete bookingDetails.tripAmount;
        delete bookingDetails.upcharges;

        return bookingDetails;
    };

    const handleReduction = async () => {
        try {
            setSubmitting(true);
            const session = await getSession();
            const payload = createPayloadForCheckout('reduction', session.userId);
            const response = await createTripReduction(payload);
            console.log('Trip Reduction Response', response);
            if (response.success) {
                toast({
                    title: 'Trip reduced successfully',
                    description: 'Your trip has been reduced successfully',
                    duration: 5000,
                    variant: 'success',
                });
                setModifyCalenderOpen(false);
                window.location.reload();
            } else {
                toast({
                    title: 'Something went wrong while reducing the trip',
                    description: response.message,
                    duration: 5000,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.log(error);
            toast({
                title: 'Something went wrong while reducing the trip',
                description: error.message,
                duration: 5000,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleExtension = async () => {
        try {
            setSubmitting(true);
            const session = await getSession();
            const payload = createPayloadForCheckout('reduction', session.userId);
            // console.log('Trip Extension Response',payload)
            const response = await createTripExtension(payload);
            // console.log('Trip Extension Response', response);
            if (response.success) {
                toast({
                    title: 'Trip extended successfully',
                    description: 'Your trip has been extended successfully',
                    duration: 5000,
                    variant: 'success',
                });
                setModifyCalenderOpen(false);
                window.location.reload();
            } else {
                toast({
                    title: 'Something went wrong while extending the trip',
                    description: response.message,
                    duration: 5000,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.log(error);
            toast({
                title: 'Something went wrong while extending the trip',
                description: error.message,
                duration: 5000,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openModifiyDialog = () => {
        setModifyCalenderOpen(true);
    };

    const closeModifyDialog = () => {
        setModifyCalenderOpen(false);
        const body = document.querySelector('body');
        body.style.overflow = 'auto';
        setPriceCalculatedList(null);
        setIsExtension(false);
        setError('');
        setComments('');
        window.location.reload();
    };

    return (
        <>
            <div className='mx-auto mb-10 max-w-7xl px-4 py-2 sm:px-6 md:mb-14 lg:px-8'>
                <div className='mt-3 grid grid-cols-1 gap-6 md:mt-6 md:grid-cols-2 md:gap-10 lg:grid-cols-3'>
                    <div className='flex flex-col lg:col-span-2'>
                        <TripVehicleDetailsComponent
                            car={tripsData.vehicleDetails[0]}
                            driverUploadedImages={tripsData.driverTripStartingBlobs}
                            hostUploadedImages={tripsData.hostTripStartingBlobs}
                        />
                    </div>

                    <div className='mt-4 lg:row-span-3 lg:mt-0'>
                        <TripImageVideoUploadComponent tripsData={tripsData} />

                        <div className='mt-10 flex flex-col gap-4'>
                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Total Booking Days</div>
                                <div className='text-md font-medium'>
                                    {tripsData.tripPaymentTokens[0]?.totaldays} {tripsData?.tripPaymentTokens[0]?.totaldays == 1 ? 'Day' : 'Days'}
                                </div>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Trip Start Date</div>
                                <div className='text-md font-medium'>{formatDateAndTime(tripsData.starttime, tripsData.vehzipcode)}</div>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Trip End Date</div>
                                <div className='text-md font-medium'>{formatDateAndTime(tripsData.endtime, tripsData.vehzipcode)}</div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Pickup & Return</div>
                                <div className='text-md font-medium'>
                                    {tripsData?.vehaddress1 ? `${toTitleCase(tripsData?.vehaddress1)}, ` : null}
                                    {tripsData?.vehaddress2 ? `${toTitleCase(tripsData?.vehaddress2)}, ` : null}
                                    {tripsData?.vehcity ? `${toTitleCase(tripsData?.vehcity)}, ` : null}
                                    {tripsData?.vehstate ? `${toTitleCase(tripsData?.vehstate)}, ` : null}
                                    {tripsData?.vehzipcode ? `${tripsData?.vehzipcode}` : null}
                                </div>
                            </div>

                            <TripPriceListComponent pricelist={tripsData?.tripPaymentTokens[0]} />

                            <div className=' flex justify-between'>
                                <label className='font-bold'>Trip Status</label>
                                <span
                                    className={`rounded px-2.5  py-1.5 text-sm font-medium dark:text-red-300 ${
                                        tripsData.status.toLowerCase() === 'approved' || tripsData.status.toLowerCase() === 'completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900'
                                            : tripsData.status === 'Requested'
                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
                                              : tripsData.status === 'Started'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900'
                                    }`}>
                                    {tripsData.status}
                                </span>
                            </div>

                            {swapRequestDetails && (
                                <SwapComponent
                                    swapRequestDetails={swapRequestDetails}
                                    originalStartDate={new Date(tripsData.starttime)}
                                    originalEndDate={new Date(tripsData.endtime)}
                                />
                            )}

                            {tripsData.status.toLowerCase() === 'requested' && <FreeCancellationDate tripsData={tripsData} />}

                            {tripsData.isRentalAgreed && (
                                <Button
                                    variant='ghost'
                                    onClick={() => {
                                        // console.log(tripsData.rentalAgrrementUrl)
                                        rentalAgreementModal.setRentalAgreementPDFLink(tripsData.rentalAgrrementUrl);
                                        rentalAgreementModal.setIsAgreementAcceptedOn(format(new Date(tripsData.rentalAgreedDate), 'PP, h:mm a'));
                                        rentalAgreementModal.onOpen();
                                    }}
                                    className='font-medium leading-none tracking-wide underline underline-offset-2'>
                                    View Rental Agreement
                                </Button>
                            )}
                        </div>

                        {!tripsData.isRentalAgreed &&
                        ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripsData.status.toLowerCase()) == -1 ? (
                            <Button
                                size='lg'
                                variant='outline'
                                className='mt-6 w-full'
                                onClick={() => {
                                    // console.log(tripsData.rentalAgrrementUrl)
                                    rentalAgreementModal.setRentalAgreementPDFLink(tripsData.rentalAgrrementUrl);
                                    rentalAgreementModal.setTripId(tripsData.tripid);
                                    rentalAgreementModal.onOpen();
                                }}>
                                Accept Rental Agreement
                            </Button>
                        ) : (
                            <div className='mt-10 grid w-full grid-cols-2  gap-3'>
                                {tripsData.status.toLowerCase() === 'approved' && swapRequestDetails?.statuscode.toLowerCase() !== 'swappr' && (
                                    <StartTripComponent starttime={tripsData.starttime} tripid={tripsData.tripid} key={tripsData.tripid} />
                                )}
                            </div>
                        )}

                        <div className='mt-6 grid w-full grid-cols-2  gap-3'>
                            {['approved', 'started', 'requested'].indexOf(tripsData.status.toLowerCase()) !== -1 && (
                                <Button
                                    onClick={() => {
                                        setModifyCalenderOpen(true);
                                        const body = document.querySelector('body');
                                        body.style.overflow = 'hidden';
                                    }}
                                    variant='black'
                                    className='w-full'
                                    size='lg'>
                                    Modify trip
                                </Button>
                            )}

                            {['started', 'cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(tripsData.status.toLowerCase()) === -1 && (
                                <CancelTripComponent tripId={tripsData.tripid} />
                            )}
                        </div>

                        {tripsData.invoiceUrl && (
                            <div className='flex flex-col gap-2'>
                                <Button
                                    className='flex items-center gap-3'
                                    variant='outline'
                                    onClick={() => {
                                        // console.log(tripsData.rentalAgrrementUrl)
                                        rentalAgreementModal.setInvoicePDFLink(tripsData.invoiceUrl);
                                        rentalAgreementModal.onOpen();
                                    }}>
                                    <Download className='size-4' /> Download Invoice
                                </Button>
                            </div>
                        )}

                        {tripsData.status.toLowerCase() == 'completed' && tripRating.length == 0 && (
                            <div
                                className='mt-4 flex w-full cursor-pointer justify-center rounded-md bg-orange-400 px-10 py-2 text-center text-sm font-medium tracking-tight text-white'
                                onClick={() => {
                                    tripReviewModal.onOpen();
                                    tripReviewModal.setTripData(tripsData);
                                }}>
                                Add a review
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ResponsiveDialog
                isOpen={modifyCalenderOpen}
                openDialog={openModifiyDialog}
                closeDialog={closeModifyDialog}
                closeOnClickOutside={false}
                title='Trip Date & Time Modification'
                className='lg:max-w-3xl'>
                <div className={`grid w-full   grid-cols-1 gap-4 lg:grid-cols-2`}>
                    <div className='col-span-1'>
                        <div className='mb-4 flex'>
                            <div className='flex-2 flex w-full flex-col gap-1'>
                                <TimeSelect
                                    label='Trip Start Time'
                                    // defaultValue={format(new Date(tripsData.starttime), 'HH:mm:ss')}
                                    defaultValue={formatTime(tripsData.starttime, tripsData?.vehzipcode)}
                                    onChange={time => {
                                        setNewStartTime(time);
                                        getPriceCalculation();
                                    }}
                                />
                            </div>
                            <div className='flex-2 ml-4 flex w-full flex-col gap-1'>
                                <TimeSelect
                                    label='Trip End Time'
                                    defaultValue={formatTime(tripsData.endtime, tripsData?.vehzipcode)}
                                    onChange={time => {
                                        setNewEndTime(time);
                                        getPriceCalculation();
                                    }}
                                />
                            </div>
                        </div>

                        <div className='flex justify-center lg:ml-6'>
                            <ModificationCalendarComponent
                                vehicleid={tripsData.vehicleId}
                                tripid={tripsData.tripid}
                                originalStartDate={convertToCarDate(tripsData.starttime, tripsData?.vehzipcode)}
                                originalEndDate={convertToCarDate(tripsData.endtime, tripsData?.vehzipcode)}
                                setError={setError}
                                setNewStartDate={setNewStartDate}
                                setNewEndDate={setNewEndDate}
                                setIsInitialLoad={setIsInitialLoad}
                                tripStarted={tripsData.status.toLowerCase() === 'started'}
                            />
                        </div>
                    </div>

                    <div className='col-span-1 flex flex-col justify-between mt-auto'>
                        {!error && (
                            <>
                                {priceLoading ? (
                                    <div className='mt-4 text-center'>
                                        <PriceCalculatedListSkeleton />
                                    </div>
                                ) : (
                                    <>
                                        {priceCalculatedList ? (
                                            <div className='flex flex-col gap-4 justify-between '>
                                                <div className=''>
                                                    <Label>Comments (optional)</Label>
                                                    <Textarea
                                                        className='mt-2'
                                                        placeholder='Add any comments here'
                                                        rows={3}
                                                        value={comments}
                                                        onChange={e => setComments(e.target.value)}
                                                    />
                                                </div>
                                                <TripModificationPriceListComponent
                                                    priceCalculatedList={priceCalculatedList}
                                                    isExtension={isExtension}
                                                    newStartDate={newStartDate}
                                                    newEndDate={newEndDate}
                                                    newStartTime={newStartTime}
                                                    newEndTime={newEndTime}
                                                    zipCode={tripsData?.vehzipcode}
                                                />

                                                <footer className='mt-6 flex select-none items-center justify-end gap-4'>
                                                    <Button type='button' onClick={closeModifyDialog} variant='outline'>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type='button'
                                                        onClick={isExtension ? handleExtension : handleReduction}
                                                        className={`bg-primary ${error ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        disabled={!!error || submitting}>
                                                        {priceLoading || submitting ? (
                                                            <div className='px-10'>
                                                                <div className='loader'></div>
                                                            </div>
                                                        ) : (
                                                            <>{isExtension ? 'Continue to book' : 'Continue'}</>
                                                        )}
                                                    </Button>
                                                </footer>
                                            </div>
                                        ) : (
                                            <div className=''>
                                                <p>Please select the dates to which you want to modify the trip.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </ResponsiveDialog>
        </>
    );
}
