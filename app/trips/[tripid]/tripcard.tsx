import { calculatePriceForTripExtension, calculatePriceForTripReduction } from '@/app/_actions/calculatePrice';
import { startTripByDriver } from '@/app/_actions/startTripByDriver';
import { tripReduction } from '@/app/_actions/trip_reduction';
import TimeSelect from '@/components/custom/TimeSelect';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import secureLocalStorage from 'react-secure-storage';
import CancelTripComponent from './CancelTripComponent';
import ModificationCalendarComponent from './ModificationCalendarComponent';
import SwapComponent from './SwapComponent';
import TripPriceListComponent from './TripPriceListComponent';
import VehicleDetailsComponent from './VehicleDetailsComponent';
import { roundToTwoDecimalPlaces } from '@/lib/utils';

const TripsDetails = ({ tripsData }) => {
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
        // console.log('tripdata', tripsData);

        setPickupTime(format(new Date(tripsData[0].starttime), 'HH:mm:ss'));
        setDropTime(format(new Date(tripsData[0].endtime), 'HH:mm:ss'));

        setSwapRequestDetails(tripsData[0].swapDetails[0]);
    }, []);

    if (!Array.isArray(tripsData) || tripsData.length === 0) {
        return <div>No trips available.</div>;
    }

    const handleExtensionCase = async () => {
        const authToken = localStorage.getItem('bundee_auth_token');
        setPriceLoading(true);
        setDisableCheckout(true);
        // console.log(newStartDate, newEndDate);

        try {
            const body = {
                vehicleid: tripsData[0].vehicleId,
                tripid: tripsData[0].tripid,
                extendedStartTime: new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime).toISOString(),
                extendedEndTime: new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime).toISOString(),
            };
            // console.log(body);

            const data = await calculatePriceForTripExtension(body, authToken);

            if (data.errorcode == 0) {
                setDisableCheckout(false);
                setPriceCalculatedList(data?.priceCalculatedList[0]);
                setDeductionConfigData(data?.deductionDetails[0]);
                // console.log(data?.priceCalculatedList[0]);
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
            vehicleid: tripsData[0].vehicleId,
            startTime: new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime).toISOString(),
            endTime: new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime).toISOString(),
            hostid: tripsData[0].hostid,
            upcharges: tripsData[0].tripPaymentTokens[0].upcharges || 0,
            delivery: tripsData[0].tripPaymentTokens[0].deliveryCost || 0,
            tripFee: tripsData[0].tripPaymentTokens[0].tripFee || 0,
        };

        const authToken = localStorage.getItem('bundee_auth_token');

        // console.log(payload);
        try {
            const responseData = await calculatePriceForTripReduction(payload, authToken);

            if (responseData.errorCode == 0) {
                setPriceCalculatedList(responseData.priceCalculatedList?.[0]);
                setDeductionConfigData(responseData.deductionDetails?.[0]);
                // console.log(responseData?.priceCalculatedList[0]);
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
        const hostid = tripsData[0].hostid;
        const token = localStorage.getItem('auth_token_login') || '';
        const userId = localStorage.getItem('userId') || '';

        try {
            const newStart = new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime);
            const newEnd = new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime);

            const reductionDetails = {
                tripid: tripsData[0].tripid,
                userId: Number(userId),
                startTime: newStart.toISOString(),
                endTime: newEnd.toISOString(),
                paymentauthorizationconfigid: deductionConfigData.authorizationConfigId || 1,
                authorizationamount: priceCalculatedList.authAmount,
                authorizationpercentage: priceCalculatedList.authPercentage,
                perDayAmount: priceCalculatedList.pricePerDay,
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
            };
            delete reductionDetails.hostPriceMap;
            delete reductionDetails.tripAmount;
            delete reductionDetails.delivery;
            delete reductionDetails.authAmount;
            delete reductionDetails.authPercentage;
            delete reductionDetails.numberOfDays;
            delete reductionDetails.pricePerDay;
            delete reductionDetails.totalAmount;
            delete reductionDetails.upcharges;
            delete reductionDetails.stateSurchargeAmount;
            delete reductionDetails.stateSurchargeTax;

            // console.log('reductionDetails', reductionDetails);
            const res = await tripReduction(reductionDetails, token);
            // console.log(res);
            if (res.errorCode == '1') {
                setTimeout(() => {
                    window.location.reload();
                }, 400);
                toast({
                    duration: 3000,
                    className: 'bg-red-400 text-white',
                    title: 'Oops! Something went wrong in trip reduction.',
                    description: 'Please try again.',
                });
            } else {
                closeModifyDialog();
                toast({
                    duration: 3000,
                    className: 'bg-green-400 text-white',
                    title: 'Trip reduced successful.',
                    description: '',
                });
                setTimeout(() => {
                    window.location.reload();
                }, 400);
            }
        } catch (error) {
            console.log('Error handling reduction:', error);
        }
    };

    const handleExtension = async () => {
        const hostid = tripsData[0].hostid;
        const userId = localStorage.getItem('userId') || '';

        try {
            const vechicleName = tripsData[0].vehicleDetails[0].make + ' ' + tripsData[0].vehicleDetails[0].model + ' ' + tripsData[0].vehicleDetails[0].year;

            const vechileImage = tripsData[0].vehicleDetails[0].imageresponse[0].imagename;
            // const data  =
            const newStart = new Date(format(new Date(newStartDate), 'yyyy-MM-dd') + 'T' + pickupTime);
            const newEnd = new Date(format(new Date(newEndDate), 'yyyy-MM-dd') + 'T' + dropTime);

            const extensionDetails = {
                tripid: tripsData[0].tripid,
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

                vehicleid: tripsData[0].vehicleId,
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
            };
            // console.log(extensionDetails)

            secureLocalStorage.setItem('checkOutInfo', JSON.stringify(extensionDetails));

            window.location.href = `/checkout/${tripsData[0].vehicleId}`;
        } catch (error) {
            console.log('Error handling extension:', error);
        }
    };

    const calFreeCancellationDate = () => {
        const freeCancellationDate = new Date(tripsData[0].starttime);
        freeCancellationDate.setDate(freeCancellationDate.getDate() - Number(tripsData[0].cancellationDays));
        return freeCancellationDate;
    };

    const handleStartTrip = async () => {
        const data = {
            tripid: tripsData[0].tripid,
            changedBy: 'USER',
            comments: 'Trip started from driver',
        };

        console.log(data);

        try {
            setTripStarting(true);
            const token = localStorage.getItem('auth_token_login') || '';
            const response = await startTripByDriver(data, token);
            console.log(response);
            if (response.errorCode == 0) {
                window.location.reload();
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
            {tripsData ? (
                <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 py-2 mb-10 md:mb-14'>
                    {tripsData.map((item, index) => (
                        <div key={index} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-3 md:mt-6'>
                            <div className='flex-col flex lg:col-span-2'>
                                <VehicleDetailsComponent
                                    car={item.vehicleDetails[0]}
                                    driverUploadedImages={item.driverTripStartingBlobs}
                                    hostUploadedImages={item.hostTripStartingBlobs}
                                />
                            </div>

                            <div className='mt-4 lg:row-span-3 lg:mt-0'>
                                {/* <div className='flex flex-col gap-3'>
                                    <p className='text-3xl font-bold tracking-tight text-neutral-900'>{`$${item.vehicleDetails[0].price_per_hr} / day`}</p>
                                    <p className='text-base text-gray-900'>
                                        Total Rental Charges : <b>${item?.tripPaymentTokens[0]?.tripTaxAmount.toFixed(2)}</b>{' '}
                                    </p>


                                </div> */}

                                <div className='mt-10 flex flex-col gap-4'>
                                    <div className='flex justify-between items-center'>
                                        <div className='text-md'>Total Booking Days</div>
                                        <div className='text-md font-medium'>
                                            {item.tripPaymentTokens[0].totaldays} {item?.tripPaymentTokens[0]?.totaldays == 1 ? 'Day' : 'Days'}
                                        </div>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <div className='text-md'>Trip Start Date</div>
                                        <div className='text-md font-medium'>
                                            {format(new Date(item.starttime), 'LLL dd, y')} | {format(new Date(item.starttime), 'h:mm a')}
                                        </div>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <div className='text-md'>Trip End Date</div>
                                        <div className='text-md font-medium'>
                                            {format(new Date(item.endtime), 'LLL dd, y')} | {format(new Date(item.endtime), 'h:mm a')}
                                        </div>
                                    </div>

                                    <div className='flex justify-between items-center'>
                                        <div className='text-md'>Pickup & Return</div>
                                        <div className='text-md font-medium'>
                                            {item?.vehaddress1 ? `${item?.vehaddress1}, ` : null}
                                            {item?.vehaddress2 ? `${item?.vehaddress2}, ` : null}
                                            {item?.vehcity ? `${item?.vehcity}, ` : null}
                                            {item?.vehstate ? `${item?.vehstate}, ` : null}
                                            {item?.vehzipcode ? `${item?.vehzipcode}` : null}
                                        </div>
                                    </div>

                                    <TripPriceListComponent pricelist={item?.tripPaymentTokens[0]} />

                                    <div className=' flex justify-between'>
                                        <label className='font-bold'>Trip Status</label>
                                        <span
                                            className={`text-sm font-medium  px-2.5 py-1.5 rounded dark:text-red-300 ${
                                                item.status === 'Approved'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900'
                                                    : item.status === 'Requested'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
                                                    : item.status === 'Started'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    {swapRequestDetails && (
                                        <SwapComponent
                                            swapRequestDetails={swapRequestDetails}
                                            originalStartDate={new Date(tripsData[0].starttime)}
                                            originalEndDate={new Date(tripsData[0].endtime)}
                                        />
                                    )}

                                    {item.status.toLowerCase() === 'requested' && (
                                        <div className='mt-4 rounded-md bg-red-50 px-2 py-3 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 w-full flex items-center justify-center'>
                                            <p className='text-center '>
                                                Free Cancellation till <b className='ml-2'> {format(calFreeCancellationDate(), 'PPP')}</b>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className='flex gap-3 flex-wrap mt-10  w-full'>
                                    {item.status.toLowerCase() === 'approved' &&
                                        swapRequestDetails?.statuscode.toLowerCase() !== 'swappr' &&
                                        new Date().getTime() < new Date(item.starttime).getTime() - 1000 * 60 * 60 && (
                                            <Button onClick={handleStartTrip} disabled={tripStarting} className='bg-green-500' size='lg'>
                                                {tripStarting ? <div className='loader'></div> : 'Start Trip'}
                                            </Button>
                                        )}

                                    {item.status.toLowerCase() === 'approved' || item.status.toLowerCase() === 'started' || item.status.toLowerCase() === 'requested' ? (
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

                                    {item.status.toLowerCase() !== 'started' && <CancelTripComponent tripId={item.tripid} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='text-center mt-10 py-12 md:py-20'>{<p>Loading trip details...</p>}</div>
            )}

            {modifyCalenderOpen && (
                <div>
                    <div className='fixed inset-0 z-40 flex items-end bg-black bg-opacity-20 sm:items-center sm:justify-center appear-done enter-done backdrop-blur-[4px]'>
                        <div className='w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg sm:rounded-lg sm:m-4 md:w-auto md:p-7 appear-done enter-done ' role='dialog'>
                            <div data-focus-lock-disabled='false'>
                                <header className='flex justify-between gap-2'>
                                    <div>
                                        <span className='font-bold'>Trip Modification </span>
                                        {error ? <span className='text-red-500 mt-4'>{error}</span> : null}
                                    </div>

                                    <Button variant='ghost' className='inline-flex items-center justify-center p-2 text-neutral-600' aria-label='close' onClick={closeModifyDialog}>
                                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20' role='img' aria-hidden='true'>
                                            <path
                                                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                                clipRule='evenodd'
                                                fillRule='evenodd'></path>
                                        </svg>
                                    </Button>
                                </header>

                                <div className={`grid grid-cols-1   gap-4 w-full ${priceCalculatedList ? 'lg:grid-cols-2' : ''}`}>
                                    <div className='col-span-1'>
                                        <div className='flex mb-4'>
                                            <div className='flex flex-col gap-1 w-full flex-2'>
                                                <TimeSelect label='Trip Start Time' defaultValue={format(new Date(tripsData[0].starttime), 'HH:mm:ss')} onChange={setPickupTime} />
                                            </div>
                                            <div className='ml-4 flex flex-col gap-1 w-full flex-2'>
                                                <TimeSelect label='Trip End Time' defaultValue={format(new Date(tripsData[0].endtime), 'HH:mm:ss')} onChange={setDropTime} />
                                            </div>
                                        </div>

                                        <div className='flex justify-center'>
                                            <ModificationCalendarComponent
                                                vehicleid={tripsData[0].vehicleId}
                                                tripid={tripsData[0].tripid}
                                                originalStartDate={format(new Date(tripsData[0].starttime), 'yyyy-MM-dd')}
                                                originalEndDate={format(new Date(tripsData[0].endtime), 'yyyy-MM-dd')}
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

                                    <div className='flex flex-col gap-4 col-span-1'>
                                        {!error && (
                                            <div className='px-3 mt-auto'>
                                                {priceLoading ? (
                                                    <div className='text-center mt-4'>Calculating price...</div>
                                                ) : (
                                                    <>
                                                        {priceCalculatedList && (
                                                            <div>
                                                                <div className='space-y-2'>
                                                                    <p className='text-xs  text-gray-900 flex justify-between pt-1'>
                                                                        Start Date :
                                                                        <span className='ml-2 '>
                                                                            {newStartDate
                                                                                ? `${format(new Date(newStartDate), 'LLL dd, y')} | ${format(
                                                                                      parse(pickupTime, 'HH:mm:ss', new Date()),
                                                                                      'h:mm a'
                                                                                  )}`
                                                                                : 'Dates not selected'}
                                                                        </span>
                                                                    </p>
                                                                    <p className='text-xs  text-gray-900 flex justify-between pt-1'>
                                                                        End Date :
                                                                        <span className='ml-2 '>
                                                                            {newEndDate
                                                                                ? `${format(new Date(newEndDate), 'LLL dd, y')} | ${format(
                                                                                      parse(dropTime, 'HH:mm:ss', new Date()),
                                                                                      'h:mm a'
                                                                                  )}`
                                                                                : 'Dates not selected'}
                                                                        </span>
                                                                    </p>
                                                                    {priceCalculatedList?.numberOfDays > 0 && (
                                                                        <div className='flex justify-between items-center pt-1'>
                                                                            <div className='text-xs'>{isExtensionNeeded ? 'Trip Extension in days' : 'Total Trip in days'} </div>
                                                                            <div className='text-xs font-medium'>{priceCalculatedList.numberOfDays}</div>
                                                                        </div>
                                                                    )}

                                                                    {priceCalculatedList?.charges > 0 && (
                                                                        <div className='flex justify-between items-center pt-1'>
                                                                            <div className='text-xs'>
                                                                                Rental (${priceCalculatedList?.pricePerDay} X {priceCalculatedList?.numberOfDays} days)
                                                                            </div>
                                                                            <div className='text-xs font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.charges)}</div>
                                                                        </div>
                                                                    )}

                                                                    {priceCalculatedList?.delivery > 0 && (
                                                                        <div className='flex justify-between items-center'>
                                                                            <div className='text-xs flex items-center gap-1'>
                                                                                <p>Additional services chosen</p>
                                                                                <Popover>
                                                                                    <PopoverTrigger asChild>
                                                                                        <Button variant='ghost' className=' w-fit p-0 h-fit' type='button'>
                                                                                            <IoInformationCircleOutline className='w-4 h-4 text-neutral-600' />
                                                                                        </Button>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent className='w-80'>
                                                                                        <div className='grid gap-4 select-none'>
                                                                                            <h4 className='font-medium leading-none'> Additional services chosen</h4>
                                                                                            <div className='space-y-1'>
                                                                                                {priceCalculatedList?.delivery > 0 && (
                                                                                                    <div className='flex justify-between items-center'>
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
                                                                            <div className='text-xs font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.delivery)}</div>
                                                                        </div>
                                                                    )}

                                                                    {priceCalculatedList?.numberOfDaysDiscount > 0 && (
                                                                        <div className='flex justify-between items-centerpt-1'>
                                                                            <div className='text-xs flex items-center gap-1'>
                                                                                Discount
                                                                                <span>
                                                                                    <Popover>
                                                                                        <PopoverTrigger asChild>
                                                                                            <Button variant='ghost' className=' w-fit p-0 h-fit' type='button'>
                                                                                                <IoInformationCircleOutline className='w-4 h-4 text-neutral-600' />
                                                                                            </Button>
                                                                                        </PopoverTrigger>
                                                                                        <PopoverContent className='w-68'>
                                                                                            <div className='grid gap-4 select-none'>
                                                                                                <div className='space-y-2'>
                                                                                                    <h4 className='font-medium leading-none'>Discount</h4>
                                                                                                </div>
                                                                                                <div className='space-y-1'>
                                                                                                    {priceCalculatedList?.discountAmount > 0 && (
                                                                                                        <div className='flex justify-between items-center'>
                                                                                                            <div className='text-sm'>
                                                                                                                {priceCalculatedList?.numberOfDaysDiscount} Day Discount applied -{' '}
                                                                                                                {roundToTwoDecimalPlaces(priceCalculatedList?.discountPercentage)} %
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
                                                                        <div className='flex justify-between items-center pt-1'>
                                                                            <div className='text-xs flex items-center gap-1'>Short notice rental fee</div>
                                                                            <div className='text-xs font-medium '>$ {priceCalculatedList?.upcharges}</div>
                                                                        </div>
                                                                    )}

                                                                    {(priceCalculatedList?.tripFee > 0 || priceCalculatedList?.concessionFee > 0 || priceCalculatedList?.statesurchargeamount > 0 || priceCalculatedList?.registrationRecoveryFee > 0) && (
                                                                        <div className='flex justify-between items-center '>
                                                                            <div className='text-xs flex items-center gap-1'>
                                                                                Trip Fee
                                                                                <span>
                                                                                    <Popover>
                                                                                        <PopoverTrigger asChild>
                                                                                            <Button variant='ghost' className=' w-fit p-0 h-fit' type='button'>
                                                                                                <IoInformationCircleOutline className='w-4 h-4 text-neutral-600' />
                                                                                            </Button>
                                                                                        </PopoverTrigger>
                                                                                        <PopoverContent className='w-80'>
                                                                                            <div className='grid gap-4 select-none'>
                                                                                                <div className='space-y-2'>
                                                                                                    <h4 className='font-medium leading-none'>Trip Fee</h4>
                                                                                                </div>
                                                                                                <div className='space-y-1'>
                                                                                                    {priceCalculatedList?.concessionFee > 0 && (
                                                                                                        <div className='flex justify-between items-center'>
                                                                                                            <div className='text-sm'>Airport concession recovery fee</div>
                                                                                                            <div className='text-sm font-medium'>
                                                                                                                $ {roundToTwoDecimalPlaces(priceCalculatedList?.concessionFee)}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {priceCalculatedList?.stateSurchargeAmount > 0 && (
                                                                                                        <div className='flex justify-between items-center'>
                                                                                                            <div className='text-sm'>State Surcharge </div>
                                                                                                            <div className='text-sm font-medium'>
                                                                                                                ${' '}
                                                                                                                {roundToTwoDecimalPlaces(priceCalculatedList?.stateSurchargeAmount)}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {priceCalculatedList?.registrationRecoveryFee > 0 && (
                                                                                                        <div className='flex justify-between items-center'>
                                                                                                            <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                                                                            <div className='text-sm font-medium'>
                                                                                                                ${' '}
                                                                                                                {roundToTwoDecimalPlaces(
                                                                                                                    priceCalculatedList?.registrationRecoveryFee
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {priceCalculatedList?.tripFee > 0 && (
                                                                                                        <div className='flex justify-between items-center'>
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
                                                                                        priceCalculatedList?.tripFee
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {priceCalculatedList?.taxAmount > 0 && (
                                                                        <div className='flex justify-between items-center'>
                                                                            <div className='text-xs'>Sales Taxes ({priceCalculatedList?.taxPercentage * 100}%)</div>
                                                                            <div className='text-xs font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.taxAmount)}</div>
                                                                        </div>
                                                                    )}
                                                                    <hr />

                                                                    {priceCalculatedList?.tripTaxAmount > 0 && (
                                                                        <div className='flex justify-between items-center mb-6 '>
                                                                            <div className='text-sm font-semibold'>Extra Charges</div>
                                                                            <div className='text-sm  font-semibold'>
                                                                                $ {roundToTwoDecimalPlaces(priceCalculatedList?.tripTaxAmount)}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <footer className='flex items-center justify-end gap-4 select-none mt-6'>
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TripsDetails;
