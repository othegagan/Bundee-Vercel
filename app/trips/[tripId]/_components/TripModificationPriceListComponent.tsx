'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { convertToCarTimeZoneISO, formatDateAndTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { splitFormattedDateAndTime } from './TripModificationDialog';

interface TripModificationPriceListComponentProps {
    priceCalculatedList: any;
    zipCode: string;
    newStartDate: string;
    newEndDate: string;
    newStartTime: string;
    newEndTime: string;
    originalTripTaxAmount: number;
    isExtension: boolean;
}

export default function TripModificationPriceListComponent({
    priceCalculatedList,
    zipCode,
    newStartDate,
    newEndDate,
    newStartTime,
    newEndTime,
    originalTripTaxAmount,
    isExtension,
}: TripModificationPriceListComponentProps) {
    let differenceAmount = 0;

    if (isExtension) differenceAmount = priceCalculatedList?.tripTaxAmount - originalTripTaxAmount;
    else differenceAmount = originalTripTaxAmount - priceCalculatedList?.tripTaxAmount;

    const formattedStartDate = formatDateAndTime(convertToCarTimeZoneISO(newStartDate, newStartTime, zipCode), zipCode);
    const formattedEndDate = formatDateAndTime(convertToCarTimeZoneISO(newEndDate, newEndTime, zipCode), zipCode);

    return (
        <div className='w-full space-y-2'>
            <p className='text-14 font-semibold'>New Trip Summary</p>
            <div className='flex flex-col  justify-center gap-3 rounded-lg bg-[#FAF7F7] p-4 '>
                <div className='flex w-full justify-between gap-2 p-4'>
                    <p className='text-14 text-center'>{splitFormattedDateAndTime(formattedStartDate)}</p>
                    <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                    <p className='text-14 text-center'>{splitFormattedDateAndTime(formattedEndDate)}</p>
                </div>

                {priceCalculatedList?.numberOfDays > 0 && (
                    <div className='mt-6 flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>Trip Duration</p>
                        <p className='text-14'>
                            {priceCalculatedList.numberOfDays} {priceCalculatedList.numberOfDays === 1 ? 'Day' : 'Days'}
                        </p>
                    </div>
                )}

                {priceCalculatedList?.charges > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>
                            Rental (${priceCalculatedList?.pricePerDay} X {priceCalculatedList?.numberOfDays}
                            {priceCalculatedList.numberOfDays === 1 ? 'Day' : 'Days'})
                        </p>
                        <p className='text-14'>${roundToTwoDecimalPlaces(priceCalculatedList?.charges)}</p>
                    </div>
                )}

                {priceCalculatedList?.delivery > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <div className='flex items-center gap-1 text-xs'>
                            <p className='text-14'>Additional services chosen</p>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant='ghost' className=' h-fit w-fit p-0' type='button'>
                                        <IoInformationCircleOutline className='size-5 text-neutral-600' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-64'>
                                    <div className='grid select-none gap-4'>
                                        <p className='font-medium leading-none'> Additional services chosen</p>
                                        <div className='space-y-1'>
                                            {priceCalculatedList?.delivery > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-14'>Custom Delivery fee</div>
                                                    <div className='text-14 font-medium'>${roundToTwoDecimalPlaces(priceCalculatedList?.delivery)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='text-14 font-medium'>${roundToTwoDecimalPlaces(priceCalculatedList?.delivery)}</div>
                    </div>
                )}

                {priceCalculatedList?.numberOfDaysDiscount > 0 && (
                    <div className='items-centerpt-1 flex justify-between gap-2 px-2'>
                        <div className='flex items-center gap-1 text-xs'>
                            <p className='text-14'>Discount</p>
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' h-fit w-fit p-0' type='button'>
                                            <IoInformationCircleOutline className='size-5 text-neutral-600' />
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
                                                        <div className='text-14'>
                                                            {priceCalculatedList?.numberOfDaysDiscount} Day Discount applied -
                                                            {roundToTwoDecimalPlaces(priceCalculatedList?.discountPercentage)} %
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='text-14 font-medium text-green-500'>${roundToTwoDecimalPlaces(priceCalculatedList?.discountAmount)}</div>
                    </div>
                )}

                {priceCalculatedList?.upcharges > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>Short notice rental fee</p>
                        <p className='text-14'>${priceCalculatedList?.upcharges}</p>
                    </div>
                )}

                {(priceCalculatedList?.tripFee > 0 ||
                    priceCalculatedList?.concessionFee > 0 ||
                    priceCalculatedList?.statesurchargeamount > 0 ||
                    priceCalculatedList?.registrationRecoveryFee > 0) && (
                    <div className='flex items-center justify-between gap-2 px-2 '>
                        <div className='flex items-center gap-1'>
                            <p className='text-14'>Trip Fee</p>
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' h-fit w-fit p-0' type='button'>
                                            <IoInformationCircleOutline className='size-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-64'>
                                        <div className='grid select-none gap-4'>
                                            <div className='space-y-2'>
                                                <p className='font-medium leading-none'>Trip Fee</p>
                                            </div>
                                            <div className='space-y-1'>
                                                {priceCalculatedList?.concessionFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>Airport concession recovery fee</div>
                                                        <div className='text-14 font-medium'>
                                                            ${roundToTwoDecimalPlaces(priceCalculatedList?.concessionFee)}
                                                        </div>
                                                    </div>
                                                )}

                                                {priceCalculatedList?.stateSurchargeAmount > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>State Surcharge </div>
                                                        <div className='text-14 font-medium'>
                                                            ${roundToTwoDecimalPlaces(priceCalculatedList?.stateSurchargeAmount)}
                                                        </div>
                                                    </div>
                                                )}

                                                {priceCalculatedList?.registrationRecoveryFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>Vehicle licensing recovery fee </div>
                                                        <div className='text-14 font-medium'>
                                                            ${roundToTwoDecimalPlaces(priceCalculatedList?.registrationRecoveryFee)}
                                                        </div>
                                                    </div>
                                                )}

                                                {priceCalculatedList?.tripFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>Platform fee </div>
                                                        <div className='text-14 font-medium'>${roundToTwoDecimalPlaces(priceCalculatedList?.tripFee)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='text-14 '>
                            $
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
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>Sales Taxes ({priceCalculatedList?.taxPercentage}%)</p>
                        <p className='text-14'>${roundToTwoDecimalPlaces(priceCalculatedList?.taxAmount)}</p>
                    </div>
                )}

                {priceCalculatedList?.tripTaxAmount > 0 && (
                    <div className='flex w-full items-center justify-between border-t border-black/40 px-2 pt-2'>
                        <p className='text-14 font-bold'> New Rental Charges</p>
                        <p className='text-14 font-bold'>${roundToTwoDecimalPlaces(priceCalculatedList?.tripTaxAmount)}</p>
                    </div>
                )}

                <div className='flex w-full items-center justify-between border-t border-black/40 px-2 pt-2'>
                    <p className='text-14 font-bold'>Trip Cost Difference</p>
                    <p className='text-14 font-bold'>
                        {roundToTwoDecimalPlaces(Number(differenceAmount)) == 0 ? '' : isExtension ? '+' : '-'} $
                        {Math.abs(Number(roundToTwoDecimalPlaces(Number(differenceAmount))))}
                    </p>
                </div>
            </div>
        </div>
    );
}
