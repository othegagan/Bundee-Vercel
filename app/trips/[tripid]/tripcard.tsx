import { calculatePrice, calculatePriceForTripExtension, calculatePriceForTripReduction } from '@/app/_actions/calculatePrice';
import { getAvailabilityDatesByVehicleId } from '@/app/_actions/get_availability_dates_by_vehicle_id';
import { tripReduction } from '@/app/_actions/trip_reduction';
import TimeSelect from '@/components/custom/TimeSelect';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { differenceInCalendarDays, format, parse, set } from 'date-fns';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import CancelTripComponent from './CancelTripComponent';
import SwapComponent from './SwapComponent';
import VehicleDetailsComponent from './VehicleDetailsComponent';
import ModificationCalendarComponent from './ModificationCalendarComponent';

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

    const [pickupTime, setPickupTime] = useState('11:00:00');
    const [dropTime, setDropTime] = useState('20:00:00');

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
        console.log(newStartDate, newEndDate);

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
            airportDelivery: false,
            customDelivery: false,
            hostid: tripsData[0].hostid,
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
                ...priceCalculatedList,
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

            // console.log('reductionDetails', reductionDetails);
            const res = await tripReduction(reductionDetails, token);
            // console.log(res);
            if (res.errorCode == '1') {
                alert('something went wrong, please try again');
            } else {
                closeModifyDialog();
                window.location.reload();
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
            };

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

    return (
        <>
            {tripsData ? (
                <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 py-2'>
                    {tripsData.map((item, index) => (
                        <div key={index} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-3 md:mt-6'>
                            <div className='flex-col flex lg:col-span-2'>
                                <VehicleDetailsComponent car={item.vehicleDetails[0]} />
                            </div>

                            <div className='mt-4 lg:row-span-3 lg:mt-0'>
                                <div className='flex flex-col gap-3'>
                                    <p className='text-3xl font-bold tracking-tight text-neutral-900'>{`$${item.vehicleDetails[0].price_per_hr} / day`}</p>
                                    <p className='text-base text-gray-900'>Total Rental Charges : <b>${item?.tripPaymentTokens[0]?.tripTaxAmount.toFixed(2)}</b> </p>
                                </div>

                                <div className='mt-10 flex flex-col gap-4'>
                                    <div className=' flex justify-between'>
                                        <label className='font-bold'>Total Booking Days</label>
                                        <p className='text-base text-gray-600'>
                                            {item.tripPaymentTokens[0].totaldays} {item?.tripPaymentTokens[0]?.totaldays == 1 ? 'Day' : 'Days'}
                                        </p>
                                    </div>
                                    <div className=' flex justify-between'>
                                        <label className='font-bold'>Trip Start Date</label>
                                        <p className='text-base text-gray-600'>
                                            {format(new Date(item.starttime), 'LLL dd, y')} | {format(new Date(item.starttime), 'h:mm a')}
                                        </p>
                                    </div>
                                    <div className=' flex justify-between'>
                                        <label className='font-bold'>Trip End Date</label>
                                        <p className='text-base text-gray-600'>
                                            {format(new Date(item.endtime), 'LLL dd, y')} | {format(new Date(item.endtime), 'h:mm a')}
                                        </p>
                                    </div>
                                    <div className=' flex justify-between'>
                                        <label className='font-bold'>Pickup & Return</label>
                                        <p className='text-sm text-gray-600'>
                                            {item?.vehaddress1 ? `${item?.vehaddress1}, ` : null}
                                            {item?.vehaddress2 ? `${item?.vehaddress2}, ` : null}
                                            {item?.vehcity ? `${item?.vehcity}, ` : null}
                                            {item?.vehstate ? `${item?.vehstate}, ` : null}
                                            {item?.vehzipcode ? `${item?.vehzipcode}` : null}
                                        </p>
                                    </div>
                                    <div className=' flex justify-between'>
                                        <label className='font-bold'>Trip Status</label>
                                        <span
                                            className={`text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:text-red-300 ${
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

                                {item.status.toLowerCase() === 'approved' || item.status.toLowerCase() === 'started' || item.status.toLowerCase() === 'requested' ? (
                                    <div className='mt-10 flex w-full'>
                                        <button
                                            onClick={() => {
                                                setModifyCalenderOpen(true);
                                                const body = document.querySelector('body');
                                                body.style.overflow = 'hidden';
                                            }}
                                            className='mt-4 flex w-1/2 items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white '>
                                            Modify
                                        </button>

                                        {item.status.toLowerCase() !== 'started' && <CancelTripComponent tripId={item.tripid} />}
                                    </div>
                                ) : null}
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
                        <div className='w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg sm:rounded-lg sm:m-4 md:w-auto md:p-7 appear-done enter-done' role='dialog'>
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
                                    <div className='grid-cols-1'>
                                        <div className='flex mb-4'>
                                            <div className='flex flex-col gap-1 w-full flex-2'>
                                                <TimeSelect label='Trip Start Time' defaultValue={format(new Date(tripsData[0].starttime), 'HH:mm:ss')} onChange={setPickupTime} />
                                            </div>
                                            <div className='ml-4 flex flex-col gap-1 w-full flex-2'>
                                                <TimeSelect label='Trip End Time' defaultValue={format(new Date(tripsData[0].endtime), 'HH:mm:ss')} onChange={setDropTime} />
                                            </div>
                                        </div>

                                        <ModificationCalendarComponent
                                            vehicleid={tripsData[0].vehicleId}
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

                                    <div className='flex flex-col gap-4 '>
                                        {!error && (
                                            <div className='px-3 mt-auto'>
                                                {priceLoading ? (
                                                    <div className='text-center mt-4'>Calculating price...</div>
                                                ) : (
                                                    <>
                                                        {priceCalculatedList && (
                                                            <div className=''>
                                                                <p className='text-xs font-medium leading-6 text-gray-900 flex justify-between'>
                                                                    {isExtensionNeeded ? 'Trip Extension in days' : 'Total Trip in days'} :{' '}
                                                                    <span className='ml-2 font-semibold'>{priceCalculatedList.numberOfDays}</span>
                                                                </p>
                                                                <p className='text-xs font-medium leading-6 text-gray-900 flex justify-between'>
                                                                    Modified Start Date :
                                                                    <span className='ml-2 font-semibold'>
                                                                        {newStartDate
                                                                            ? `${format(new Date(newStartDate), 'LLL dd, y')} | ${format(
                                                                                  parse(pickupTime, 'HH:mm:ss', new Date()),
                                                                                  'h:mm a'
                                                                              )}`
                                                                            : 'Dates not selected'}
                                                                    </span>
                                                                </p>
                                                                <p className='text-xs font-medium leading-6 text-gray-900 flex justify-between'>
                                                                    Modified End Date :
                                                                    <span className='ml-2 font-semibold'>
                                                                        {newEndDate
                                                                            ? `${format(new Date(newEndDate), 'LLL dd, y')} | ${format(
                                                                                  parse(dropTime, 'HH:mm:ss', new Date()),
                                                                                  'h:mm a'
                                                                              )}`
                                                                            : 'Dates not selected'}
                                                                    </span>
                                                                </p>
                                                                <p className='text-xs font-medium leading-6 text-gray-900 flex justify-between'>
                                                                    Charges (${priceCalculatedList?.pricePerDay} X {priceCalculatedList?.numberOfDays} days)
                                                                    <span className='ml-2 font-semibold'> $ {priceCalculatedList.tripAmount}</span>
                                                                </p>
                                                                <p className='text-xs font-medium leading-6 text-gray-900 flex justify-between'>
                                                                    Taxes (8.25%): <span className='ml-2 font-semibold'> $ {priceCalculatedList.taxAmount.toFixed(2)}</span>
                                                                </p>
                                                                <hr />
                                                                <p className='text-sm font-medium leading-6 text-gray-900 flex justify-between'>
                                                                    Total Rental Charges:{' '}
                                                                    <span className='ml-2 font-semibold'>$ {priceCalculatedList.tripTaxAmount.toFixed(2)}</span>
                                                                </p>
                                                                <footer className='flex items-center justify-end gap-4 select-none mt-3'>
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
