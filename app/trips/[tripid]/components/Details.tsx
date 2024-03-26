import TimeSelect from '@/components/custom/TimeSelect';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import secureLocalStorage from 'react-secure-storage';
import { roundToTwoDecimalPlaces } from '@/lib/utils';
import { calculatePriceForTripExtension, calculatePriceForTripReduction } from '@/server/priceCalculation';
import { startTripByDriver } from '@/server/userOperations';
import TripVehicleDetailsComponent from './TripVehicleDetailsComponent';
import TripPriceListComponent from './TripPriceListComponent';
import SwapComponent from './SwapComponent';
import ModificationCalendarComponent from './ModificationCalendarComponent';
import CancelTripComponent from './CancelTripComponent';
import { Modal, ModalBody, ModalHeader } from '@/components/custom/modal';
import ClientOnly from '@/components/ClientOnly';
import TripImageVideoUploadComponent from './TripImageVideoUploadComponent';
import useTripReviewModal from '@/hooks/useTripReviewModal';

export default function Details({ tripsData }: any) {
    const tripReviewModal = useTripReviewModal();
    const [modifyCalenderOpen, setModifyCalenderOpen] = useState(false);

    const [swapRequestDetails, setSwapRequestDetails] = useState(null);

    const [error, setError] = useState('');

    const [priceLoading, setPriceLoading] = useState(false);
    const [priceCalculatedList, setPriceCalculatedList] = useState(null);
    const [deductionConfigData, setDeductionConfigData] = useState(null);
    const [disableCheckout, setDisableCheckout] = useState(false);

    const [newStartDate, setNewStartDate] = useState(null);
    const [newEndDate, setNewEndDate] = useState(null);

    const [isExtensionNeeded, setIsExtensionNeeded] = useState(null);

    const [pickupTime, setPickupTime] = useState('10:00:00');
    const [dropTime, setDropTime] = useState('10:00:00');

    const [tripStarting, setTripStarting] = useState(false);

    useEffect(() => {
        setPickupTime(format(new Date(tripsData.starttime), 'HH:mm:ss'));
        setDropTime(format(new Date(tripsData.endtime), 'HH:mm:ss'));

        setSwapRequestDetails(tripsData.swapDetails[0]);
    }, [tripsData]);

    const handleExtensionCase = async () => {
        const authToken = localStorage.getItem('bundee_auth_token');
        setPriceLoading(true);
        setDisableCheckout(true);
        // console.log(newStartDate, newEndDate);

        try {
            const body = {
                vehicleid: tripsData.vehicleId,
                tripid: tripsData.tripid,
                extendedStartTime: new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime).toISOString(),
                extendedEndTime: new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime).toISOString(),
            };
            // console.log(body);

            const priceResponse = await calculatePriceForTripExtension(body);

            if (priceResponse.success) {
                const data = priceResponse.data;
                setDisableCheckout(false);
                setPriceCalculatedList(data?.priceCalculatedList[0]);
                setDeductionConfigData(data?.deductionDetails[0]);
                // console.log(data?.priceCalculatedList[0]);
            } else {
                throw new Error(priceResponse.message);
            }
        } catch (error) {
            console.error('Error in calculating the price', error);
        } finally {
            setPriceLoading(false);
        }
    };

    const handleReductionCase = async () => {
        setDisableCheckout(true);
        setPriceLoading(true);
        console.log(newStartDate, newEndDate);
        const payload = {
            vehicleid: tripsData.vehicleId,
            startTime: new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime).toISOString(),
            endTime: new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime).toISOString(),
            hostid: tripsData.hostid,
            upcharges: tripsData.tripPaymentTokens[0].upcharges || 0,
            delivery: tripsData.tripPaymentTokens[0].deliveryCost || 0,
            tripFee: tripsData.tripPaymentTokens[0].tripFee || 0,
        };

        // console.log(payload);
        try {
            const responseData = await calculatePriceForTripReduction(payload);

            if (responseData.success) {
                const data = responseData.data;
                setPriceCalculatedList(data.priceCalculatedList?.[0]);
                setDeductionConfigData(data.deductionDetails?.[0]);
                // console.log(responseData?.priceCalculatedList[0]);
            } else {
                throw new Error(responseData.message);
            }
        } catch (error) {
            console.error('Error in calculating the price', error);
        } finally {
            setDisableCheckout(false);
            setPriceLoading(false);
        }
    };

    const closeModifyDialog = () => {
        setModifyCalenderOpen(false);
        const body = document.querySelector('body');
        body.style.overflow = 'auto';
        setPriceCalculatedList(null);
        setIsExtensionNeeded(null);
        setError('');
        window.location.reload();
    };

    const handleReduction = async () => {
        const hostid = tripsData.hostid;
        const userId = localStorage.getItem('userId') || '';

        try {
            const vechicleName = tripsData.vehicleDetails[0].make + ' ' + tripsData.vehicleDetails[0].model + ' ' + tripsData.vehicleDetails[0].year;

            const vechileImage = tripsData.vehicleDetails[0].imageresponse[0].imagename;
            const newStart = new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime);
            const newEnd = new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime);

            const reductionDetails = {
                tripid: tripsData.tripid,
                userId: Number(userId),

                vehicleid: tripsData.vehicleId,
                name: vechicleName,
                image: vechileImage,
                type: 'reducution',
                hostid: hostid,

                paymentauthorizationconfigid: deductionConfigData.authorizationConfigId || 1,
                authorizationpercentage: priceCalculatedList.authPercentage,
                authorizationamount: priceCalculatedList.authAmount,
                perDayAmount: priceCalculatedList.pricePerDay,

                startTime: newStart.toISOString(),
                endTime: newEnd.toISOString(),

                totalDays: priceCalculatedList.numberOfDays,
                taxAmount: priceCalculatedList.taxAmount,
                tripTaxAmount: priceCalculatedList.tripTaxAmount,
                totalamount: priceCalculatedList.totalAmount,
                tripamount: priceCalculatedList.tripAmount,
                comments: 'Need to Reduce',
                pickupTime: pickupTime,
                dropTime: dropTime,
                upCharges: priceCalculatedList.upcharges,
                tripAuthConfigID: 0,
                deliveryCost: 0,
                extreaMilageCost: 0,
                ...priceCalculatedList,
                Statesurchargeamount: priceCalculatedList.stateSurchargeAmount,
                Statesurchargetax: priceCalculatedList.stateSurchargeTax,
                isPaymentChanged: true,
            };

            secureLocalStorage.setItem('checkOutInfo', JSON.stringify(reductionDetails));

            window.location.href = `/checkout/${tripsData.vehicleId}`;
        } catch (error) {
            console.log('Error handling reduction:', error);
        }
    };

    const handleExtension = async () => {
        const hostid = tripsData.hostid;
        const userId = localStorage.getItem('userId') || '';

        try {
            const vechicleName = tripsData.vehicleDetails[0].make + ' ' + tripsData.vehicleDetails[0].model + ' ' + tripsData.vehicleDetails[0].year;

            const vechileImage = tripsData.vehicleDetails[0].imageresponse[0].imagename;
            // const data  =
            const newStart = new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime);
            const newEnd = new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime);

            const extensionDetails = {
                tripid: tripsData.tripid,
                userId: Number(userId),

                deductionfrequencyconfigid: deductionConfigData.deductioneventconfigid || 1,
                paymentauthorizationconfigid: deductionConfigData.authorizationConfigId || 1,
                authorizationpercentage: priceCalculatedList.authPercentage,
                authorizationamount: priceCalculatedList.authAmount,
                perDayAmount: priceCalculatedList.pricePerDay,

                startTime: newStart.toISOString(),
                endTime: newEnd.toISOString(),
                totalDays: priceCalculatedList.numberOfDays,
                taxAmount: priceCalculatedList.taxAmount,
                tripTaxAmount: priceCalculatedList.tripTaxAmount,
                totalamount: priceCalculatedList.totalAmount,
                tripamount: priceCalculatedList.tripAmount,
                pickupTime: pickupTime,
                dropTime: dropTime,

                vehicleid: tripsData.vehicleId,
                name: vechicleName,
                image: vechileImage,
                type: 'modify',
                hostid: hostid,

                ...priceCalculatedList,
                upCharges: priceCalculatedList.upcharges,
                deliveryCost: 0,
                comments: 'Need to extend',
                extreaMilageCost: 0,
                Statesurchargetax: priceCalculatedList.stateSurchargeTax,
                Statesurchargeamount: priceCalculatedList.stateSurchargeAmount,
                isPaymentChanged: true,
            };
            // console.log(extensionDetails)

            secureLocalStorage.setItem('checkOutInfo', JSON.stringify(extensionDetails));

            window.location.href = `/checkout/${tripsData.vehicleId}`;
        } catch (error) {
            console.log('Error handling extension:', error);
        }
    };

    const calFreeCancellationDate = () => {
        const freeCancellationDate = new Date(tripsData.starttime);
        freeCancellationDate.setDate(freeCancellationDate.getDate() - Number(tripsData.cancellationDays));
        return freeCancellationDate;
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
                                <div className='text-md font-medium'>
                                    {format(new Date(tripsData.starttime), 'LLL dd, y')} | {format(new Date(tripsData.starttime), 'h:mm a')}
                                </div>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className='text-md'>Trip End Date</div>
                                <div className='text-md font-medium'>
                                    {format(new Date(tripsData.endtime), 'LLL dd, y')} | {format(new Date(tripsData.endtime), 'h:mm a')}
                                </div>
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

                            {tripsData.status.toLowerCase() === 'requested' && (
                                <div className='mt-4 flex w-full items-center justify-center rounded-md bg-red-50 px-2 py-3 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10'>
                                    <p className='text-center '>
                                        Free Cancellation till <b className='ml-2'> {format(calFreeCancellationDate(), 'PPP')}</b>
                                    </p>
                                </div>
                            )}
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
                <ModalBody className={`  transition-all delay-1000 ${!modifyCalenderOpen ? ' rotate-90' : ' rotate-0'}`}>
                    <div className={`grid w-full   grid-cols-1 gap-4 ${priceCalculatedList ? 'lg:grid-cols-2' : ''}`}>
                        <div className='col-span-1'>
                            <div className='mb-4 flex'>
                                <div className='flex-2 flex w-full flex-col gap-1'>
                                    <TimeSelect
                                        label='Trip Start Time'
                                        defaultValue={format(new Date(tripsData.starttime), 'HH:mm:ss')}
                                        onChange={setPickupTime}
                                    />
                                </div>
                                <div className='flex-2 ml-4 flex w-full flex-col gap-1'>
                                    <TimeSelect label='Trip End Time' defaultValue={format(new Date(tripsData.endtime), 'HH:mm:ss')} onChange={setDropTime} />
                                </div>
                            </div>

                            <div className='flex justify-center'>
                                <ModificationCalendarComponent
                                    vehicleid={tripsData.vehicleId}
                                    tripid={tripsData.tripid}
                                    originalStartDate={format(new Date(tripsData.starttime), 'yyyy-MM-dd')}
                                    originalEndDate={format(new Date(tripsData.endtime), 'yyyy-MM-dd')}
                                    setError={setError}
                                    setNewStartDate={setNewStartDate}
                                    setNewEndDate={setNewEndDate}
                                    newStartDate={newStartDate}
                                    newEndDate={newEndDate}
                                    setIsExtensionNeeded={setIsExtensionNeeded}
                                    handleExtensionCase={handleExtensionCase}
                                    handleReductionCase={handleReductionCase}
                                />
                            </div>
                        </div>

                        <div className='col-span-1 flex flex-col gap-4'>
                            {!error && (
                                <div className='mt-auto px-3'>
                                    {priceLoading ? (
                                        <div className='mt-4 text-center'>Calculating price...</div>
                                    ) : (
                                        <>
                                            {priceCalculatedList && (
                                                <div>
                                                    <div className='space-y-2'>
                                                        <p className='flex  justify-between pt-1 text-xs text-gray-900'>
                                                            Start Date :
                                                            <span className='ml-2 '>
                                                                {newStartDate
                                                                    ? `${format(new Date(newStartDate + 'T00:00:00'), 'LLL dd, y')} | ${format(
                                                                          parse(pickupTime, 'HH:mm:ss', new Date()),
                                                                          'h:mm a',
                                                                      )}`
                                                                    : 'Dates not selected'}
                                                            </span>
                                                        </p>
                                                        <p className='flex  justify-between pt-1 text-xs text-gray-900'>
                                                            End Date :
                                                            <span className='ml-2 '>
                                                                {newEndDate
                                                                    ? `${format(new Date(newEndDate + 'T00:00:00'), 'LLL dd, y')} | ${format(
                                                                          parse(dropTime, 'HH:mm:ss', new Date()),
                                                                          'h:mm a',
                                                                      )}`
                                                                    : 'Dates not selected'}
                                                            </span>
                                                        </p>
                                                        {priceCalculatedList?.numberOfDays > 0 && (
                                                            <div className='flex items-center justify-between pt-1'>
                                                                <div className='text-xs'>
                                                                    {isExtensionNeeded ? 'Trip Extension in days' : 'Total Trip in days'}{' '}
                                                                </div>
                                                                <div className='text-xs font-medium'>{priceCalculatedList.numberOfDays}</div>
                                                            </div>
                                                        )}

                                                        {priceCalculatedList?.charges > 0 && (
                                                            <div className='flex items-center justify-between pt-1'>
                                                                <div className='text-xs'>
                                                                    Rental (${priceCalculatedList?.pricePerDay} X {priceCalculatedList?.numberOfDays} days)
                                                                </div>
                                                                <div className='text-xs font-medium'>
                                                                    $ {roundToTwoDecimalPlaces(priceCalculatedList?.charges)}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {priceCalculatedList?.delivery > 0 && (
                                                            <div className='flex items-center justify-between'>
                                                                <div className='flex items-center gap-1 text-xs'>
                                                                    <p>Additional services chosen</p>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button variant='ghost' className=' h-fit w-fit p-0' type='button'>
                                                                                <IoInformationCircleOutline className='h-4 w-4 text-neutral-600' />
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className='w-80'>
                                                                            <div className='grid select-none gap-4'>
                                                                                <p className='font-medium leading-none'> Additional services chosen</p>
                                                                                <div className='space-y-1'>
                                                                                    {priceCalculatedList?.delivery > 0 && (
                                                                                        <div className='flex items-center justify-between'>
                                                                                            <div className='text-sm'>Custom Delivery fee</div>
                                                                                            <div className='text-sm font-medium'>
                                                                                                $ {roundToTwoDecimalPlaces(priceCalculatedList?.delivery)}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                                <div className='text-xs font-medium'>
                                                                    $ {roundToTwoDecimalPlaces(priceCalculatedList?.delivery)}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {priceCalculatedList?.numberOfDaysDiscount > 0 && (
                                                            <div className='items-centerpt-1 flex justify-between'>
                                                                <div className='flex items-center gap-1 text-xs'>
                                                                    Discount
                                                                    <span>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button variant='ghost' className=' h-fit w-fit p-0' type='button'>
                                                                                    <IoInformationCircleOutline className='h-4 w-4 text-neutral-600' />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className='w-68'>
                                                                                <div className='grid select-none gap-4'>
                                                                                    <div className='space-y-2'>
                                                                                        <p className='font-medium leading-none'>Discount</p>
                                                                                    </div>
                                                                                    <div className='space-y-1'>
                                                                                        {priceCalculatedList?.discountAmount > 0 && (
                                                                                            <div className='flex items-center justify-between'>
                                                                                                <div className='text-sm'>
                                                                                                    {priceCalculatedList?.numberOfDaysDiscount} Day Discount
                                                                                                    applied -{' '}
                                                                                                    {roundToTwoDecimalPlaces(
                                                                                                        priceCalculatedList?.discountPercentage,
                                                                                                    )}{' '}
                                                                                                    %
                                                                                                </div>
                                                                                                {/* <div className='text-sm font-medium'>$ {parseFloat(pricelist?.discountAmount.toString()).toFixed(2)}</div> */}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </span>
                                                                </div>
                                                                <div className='text-xs font-medium text-green-500'>
                                                                    $ {roundToTwoDecimalPlaces(priceCalculatedList?.discountAmount)}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {priceCalculatedList?.upcharges > 0 && (
                                                            <div className='flex items-center justify-between pt-1'>
                                                                <div className='flex items-center gap-1 text-xs'>Short notice rental fee</div>
                                                                <div className='text-xs font-medium '>$ {priceCalculatedList?.upcharges}</div>
                                                            </div>
                                                        )}

                                                        {(priceCalculatedList?.tripFee > 0 ||
                                                            priceCalculatedList?.concessionFee > 0 ||
                                                            priceCalculatedList?.statesurchargeamount > 0 ||
                                                            priceCalculatedList?.registrationRecoveryFee > 0) && (
                                                            <div className='flex items-center justify-between '>
                                                                <div className='flex items-center gap-1 text-xs'>
                                                                    Trip Fee
                                                                    <span>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button variant='ghost' className=' h-fit w-fit p-0' type='button'>
                                                                                    <IoInformationCircleOutline className='h-4 w-4 text-neutral-600' />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className='w-80'>
                                                                                <div className='grid select-none gap-4'>
                                                                                    <div className='space-y-2'>
                                                                                        <p className='font-medium leading-none'>Trip Fee</p>
                                                                                    </div>
                                                                                    <div className='space-y-1'>
                                                                                        {priceCalculatedList?.concessionFee > 0 && (
                                                                                            <div className='flex items-center justify-between'>
                                                                                                <div className='text-sm'>Airport concession recovery fee</div>
                                                                                                <div className='text-sm font-medium'>
                                                                                                    ${' '}
                                                                                                    {roundToTwoDecimalPlaces(
                                                                                                        priceCalculatedList?.concessionFee,
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {priceCalculatedList?.stateSurchargeAmount > 0 && (
                                                                                            <div className='flex items-center justify-between'>
                                                                                                <div className='text-sm'>State Surcharge </div>
                                                                                                <div className='text-sm font-medium'>
                                                                                                    ${' '}
                                                                                                    {roundToTwoDecimalPlaces(
                                                                                                        priceCalculatedList?.stateSurchargeAmount,
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {priceCalculatedList?.registrationRecoveryFee > 0 && (
                                                                                            <div className='flex items-center justify-between'>
                                                                                                <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                                                                <div className='text-sm font-medium'>
                                                                                                    ${' '}
                                                                                                    {roundToTwoDecimalPlaces(
                                                                                                        priceCalculatedList?.registrationRecoveryFee,
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {priceCalculatedList?.tripFee > 0 && (
                                                                                            <div className='flex items-center justify-between'>
                                                                                                <div className='text-sm'>Platform fee </div>
                                                                                                <div className='text-sm font-medium'>
                                                                                                    $ {roundToTwoDecimalPlaces(priceCalculatedList?.tripFee)}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </span>
                                                                </div>
                                                                <div className='text-xs font-medium'>
                                                                    ${' '}
                                                                    {roundToTwoDecimalPlaces(
                                                                        priceCalculatedList?.concessionFee +
                                                                            priceCalculatedList?.stateSurchargeAmount +
                                                                            priceCalculatedList?.registrationRecoveryFee +
                                                                            priceCalculatedList?.tripFee,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {priceCalculatedList?.taxAmount > 0 && (
                                                            <div className='flex items-center justify-between'>
                                                                <div className='text-xs'>Sales Taxes ({priceCalculatedList?.taxPercentage * 100}%)</div>
                                                                <div className='text-xs font-medium'>
                                                                    $ {roundToTwoDecimalPlaces(priceCalculatedList?.taxAmount)}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <hr />

                                                        {priceCalculatedList?.tripTaxAmount > 0 && (
                                                            <div className='mb-6 flex items-center justify-between '>
                                                                <div className='text-sm font-semibold'>Extra Charges</div>
                                                                <div className='text-sm  font-semibold'>
                                                                    $ {roundToTwoDecimalPlaces(priceCalculatedList?.tripTaxAmount)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <footer className='mt-6 flex select-none items-center justify-end gap-4'>
                                                        <Button type='button' onClick={closeModifyDialog} variant='outline'>
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type='button'
                                                            onClick={isExtensionNeeded ? handleExtension : handleReduction}
                                                            className={`bg-primary ${error ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            disabled={!!error || disableCheckout}>
                                                            {priceLoading ? (
                                                                <div className='px-10'>
                                                                    <div className='loader'></div>
                                                                </div>
                                                            ) : (
                                                                <>{isExtensionNeeded ? 'Continue to book' : 'Continue'}</>
                                                            )}
                                                        </Button>
                                                    </footer>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
}
