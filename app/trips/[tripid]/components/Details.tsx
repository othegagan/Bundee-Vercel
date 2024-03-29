import { Modal, ModalBody, ModalHeader } from '@/components/custom/modal';
import TimeSelect from '@/components/custom/TimeSelect';
import { CalendarSelectSkeleton } from '@/components/skeletons/skeletons';
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

export default function Details({ tripsData }: any) {
    const tripReviewModal = useTripReviewModal();

    const [modifyCalenderOpen, setModifyCalenderOpen] = useState(false);
    const [swapRequestDetails, setSwapRequestDetails] = useState(null);

    const [tripStarting, setTripStarting] = useState(false);

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

    useEffect(() => {
        setNewStartDate(format(new Date(tripsData.starttime), 'yyyy-MM-dd'));
        setNewEndDate(format(new Date(tripsData.endtime), 'yyyy-MM-dd'));
        setNewStartTime(format(new Date(tripsData.starttime), 'HH:mm:ss'));
        setNewEndTime(format(new Date(tripsData.endtime), 'HH:mm:ss'));
        setSwapRequestDetails(tripsData.swapDetails[0]);
    }, [tripsData]);

    useEffect(() => {
        if (!isInitialLoad && newStartDate && newEndDate) {
            // Check if it's not initial load
            getPriceCalculation();
        } else {
            setIsInitialLoad(true); // Update state to indicate subsequent renders
        }
    }, [newStartDate, newEndDate, isInitialLoad]);

    async function getPriceCalculation() {
        try {
            const originalDiff = differenceInHours(new Date(tripsData.endtime), new Date(tripsData.starttime));
            const newDiff = differenceInHours(new Date(newEndDate + 'T' + newEndTime), new Date(newStartDate + 'T' + newEndTime));
            // console.log(originalDiff, newDiff);

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
                startTime: new Date(newStartDate + 'T' + newStartTime).toISOString(),
                endTime: new Date(newEndDate + 'T' + newEndTime).toISOString(),
                airportDelivery: tripsData.airportDelivery,
                customDelivery: tripsData.delivery,
                hostid: tripsData.hostid,
            };

            // console.log(payload, 'payload');

            const responseData: any = await calculatePrice(payload);
            // console.log(responseData);

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

    const createPayloadForCheckout = (type, userId) => {
        const hostid = tripsData.hostid;

        const vehicleDetails = tripsData.vehicleDetails[0];
        const vechicleName = `${vehicleDetails.make} ${vehicleDetails.model} ${vehicleDetails.year}`;
        const vechileImage = vehicleDetails.imageresponse[0].imagename;

        const newStart = new Date(`${newStartDate}T${newStartTime}`);
        const newEnd = new Date(`${newEndDate}T${newEndTime}`);

        const bookingDetails = {
            tripid: tripsData.tripid,
            userId: userId,
            // vehicleid: tripsData.vehicleId,
            name: vechicleName,
            image: vechileImage,
            hostid: hostid,
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
            pickupTime: newStartTime,
            dropTime: newEndTime,
            totalDays: priceCalculatedList.numberOfDays,
            taxAmount: priceCalculatedList.taxAmount,
            tripTaxAmount: priceCalculatedList.tripTaxAmount,
            totalamount: priceCalculatedList.totalAmount,
            tripamount: priceCalculatedList.tripAmount,
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
            bookingDetails.type = 'reduction';
            bookingDetails.paymentauthorizationconfigid = deductionConfigData.authorizationConfigId || 1;
            bookingDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            bookingDetails.authorizationamount = priceCalculatedList.authAmount;
            bookingDetails.comments = 'Need to Reduce';
        } else if (type === 'extension') {
            bookingDetails.type = 'modify';
            bookingDetails.deductionfrequencyconfigid = deductionConfigData.deductioneventconfigid || 1;
            bookingDetails.paymentauthorizationconfigid = deductionConfigData.authorizationConfigId || 1;
            bookingDetails.authorizationpercentage = priceCalculatedList.authPercentage;
            bookingDetails.authorizationamount = priceCalculatedList.authAmount;
            bookingDetails.comments = 'Need to Extend';
        }

        // console.log(bookingDetails)

        secureLocalStorage.setItem('checkOutInfo', JSON.stringify(bookingDetails));
        window.location.href = `/checkout/${tripsData.vehicleId}`;
    };

    const handleReduction = async () => {
        const session = await getSession();
        createPayloadForCheckout('reduction', session.userId);
    };

    const handleExtension = async () => {
        const session = await getSession();
        createPayloadForCheckout('extension', session.userId);
    };

    const closeModifyDialog = () => {
        setModifyCalenderOpen(false);
        const body = document.querySelector('body');
        body.style.overflow = 'auto';
        setPriceCalculatedList(null);
        setIsExtension(false);
        setError('');
        window.location.reload();
    };

    const handleStartTrip = async () => {
        try {
            setTripStarting(true);
            const response = await startTripByDriver(Number(tripsData.tripid));
            if (response.success) {
                window.location.reload();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Something went wrong in starting the trip',
                });
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error starting the trip', error);
            setError(error);
        } finally {
            setTripStarting(false);
        }
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
                        <div className='flex justify-end'>
                            <TripImageVideoUploadComponent tripsData={tripsData} />
                        </div>

                        <div className='mt-10 flex flex-col gap-4'>
                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Total Booking Days</div>
                                <div className='text-md font-medium'>
                                    {tripsData.tripPaymentTokens[0].totaldays} {tripsData?.tripPaymentTokens[0]?.totaldays == 1 ? 'Day' : 'Days'}
                                </div>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Trip Start Date</div>
                                <div className='text-md font-medium'>{format(new Date(tripsData.starttime), 'LLL dd, y | h:mm a')}</div>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Trip End Date</div>
                                <div className='text-md font-medium'>{format(new Date(tripsData.endtime), 'LLL dd, y | h:mm a')}</div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Pickup & Return</div>
                                <div className='text-md font-medium'>
                                    {tripsData?.vehaddress1 ? `${tripsData?.vehaddress1}, ` : null}
                                    {tripsData?.vehaddress2 ? `${tripsData?.vehaddress2}, ` : null}
                                    {tripsData?.vehcity ? `${tripsData?.vehcity}, ` : null}
                                    {tripsData?.vehstate ? `${tripsData?.vehstate}, ` : null}
                                    {tripsData?.vehzipcode ? `${tripsData?.vehzipcode}` : null}
                                </div>
                            </div>

                            <TripPriceListComponent pricelist={tripsData?.tripPaymentTokens[0]} />

                            <div className=' flex justify-between'>
                                <label className='font-bold'>Trip Status</label>
                                <span
                                    className={`rounded px-2.5  py-1.5 text-sm font-medium dark:text-red-300 ${
                                        tripsData.status === 'Approved'
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
                        </div>

                        <div className='mt-10 flex w-full flex-wrap  gap-3'>
                            {tripsData.status.toLowerCase() === 'approved' &&
                                swapRequestDetails?.statuscode.toLowerCase() !== 'swappr' &&
                                new Date().getTime() < new Date(tripsData.starttime).getTime() - 1000 * 60 * 60 && (
                                    <Button onClick={handleStartTrip} disabled={tripStarting} className='bg-green-500' size='lg'>
                                        {tripStarting ? <div className='loader'></div> : 'Start Trip'}
                                    </Button>
                                )}

                            {tripsData.status.toLowerCase() === 'approved' ||
                            tripsData.status.toLowerCase() === 'started' ||
                            tripsData.status.toLowerCase() === 'requested' ? (
                                <Button
                                    onClick={() => {
                                        setModifyCalenderOpen(true);
                                        const body = document.querySelector('body');
                                        body.style.overflow = 'hidden';
                                    }}
                                    variant='black'
                                    size='lg'>
                                    Modify
                                </Button>
                            ) : null}

                            {tripsData.status.toLowerCase() !== 'started' &&
                                tripsData.status.toLowerCase() !== 'cancelled' &&
                                tripsData.status.toLowerCase() !== 'completed' &&
                                tripsData.status.toLowerCase() !== 'cancellation requested' && <CancelTripComponent tripId={tripsData.tripid} />}
                        </div>

                        {tripsData.status.toLowerCase() == 'completed' && tripsData?.vehicleDetails[0]?.tripreview.length == 0 && (
                            <div
                                className='mt-4 w-fit cursor-pointer rounded-md bg-orange-400 px-10 py-2 text-sm font-medium tracking-tight text-white'
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

            <Modal isOpen={modifyCalenderOpen} onClose={closeModifyDialog} className='lg:max-w-2xl'>
                <ModalHeader onClose={closeModifyDialog}>Trip Modification</ModalHeader>
                <ModalBody>
                    <div className={`grid w-full   grid-cols-1 gap-4 lg:grid-cols-2`}>
                        <div className='col-span-1'>
                            <div className='mb-4 flex'>
                                <div className='flex-2 flex w-full flex-col gap-1'>
                                    <TimeSelect
                                        label='Trip Start Time'
                                        defaultValue={format(new Date(tripsData.starttime), 'HH:mm:ss')}
                                        onChange={time => {
                                            setNewStartTime(time);
                                            getPriceCalculation();
                                        }}
                                    />
                                </div>
                                <div className='flex-2 ml-4 flex w-full flex-col gap-1'>
                                    <TimeSelect
                                        label='Trip End Time'
                                        defaultValue={format(new Date(tripsData.endtime), 'HH:mm:ss')}
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
                                    originalStartDate={format(new Date(tripsData.starttime), 'yyyy-MM-dd')}
                                    originalEndDate={format(new Date(tripsData.endtime), 'yyyy-MM-dd')}
                                    setError={setError}
                                    setNewStartDate={setNewStartDate}
                                    setNewEndDate={setNewEndDate}
                                    setIsInitialLoad={setIsInitialLoad}
                                />
                            </div>
                        </div>

                        <div className='col-span-1 mt-auto px-3'>
                            {!error && (
                                <>
                                    {priceLoading ? (
                                        <div className='mt-4 text-center'>
                                            <CalendarSelectSkeleton />
                                        </div>
                                    ) : (
                                        <>
                                            {priceCalculatedList ? (
                                                <div>
                                                    <TripModificationPriceListComponent
                                                        priceCalculatedList={priceCalculatedList}
                                                        isExtension={isExtension}
                                                        newStartDate={newStartDate}
                                                        newEndDate={newEndDate}
                                                        newStartTime={newStartTime}
                                                        newEndTime={newEndTime}
                                                    />

                                                    <footer className='mt-6 flex select-none items-center justify-end gap-4'>
                                                        <Button type='button' onClick={closeModifyDialog} variant='outline'>
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type='button'
                                                            onClick={isExtension ? handleExtension : handleReduction}
                                                            className={`bg-primary ${error ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            disabled={!!error}>
                                                            {priceLoading ? (
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
                </ModalBody>
            </Modal>
        </>
    );
}
