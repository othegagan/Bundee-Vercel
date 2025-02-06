'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { convertToCarTimeZoneISO, formatDateAndTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { splitFormattedDateAndTime } from './TripModificationDialog';

interface TripModificationPriceListComponentProps {
    pricelist: any;
    zipCode: string;
    newStartDate: string;
    newEndDate: string;
    newStartTime: string;
    newEndTime: string;
    originalTripTaxAmount: number;
    isExtension: boolean;
    isAirportDeliveryChoosen: boolean;
    isCustomDeliveryChoosen: boolean;
}

export default function TripModificationPriceListComponent({
    pricelist,
    zipCode,
    newStartDate,
    newEndDate,
    newStartTime,
    newEndTime,
    originalTripTaxAmount,
    isExtension,
    isAirportDeliveryChoosen,
    isCustomDeliveryChoosen
}: TripModificationPriceListComponentProps) {
    let differenceAmount = 0;

    if (isExtension) differenceAmount = pricelist?.tripTaxAmount - originalTripTaxAmount;
    else differenceAmount = originalTripTaxAmount - pricelist?.tripTaxAmount;

    const formattedStartDate = formatDateAndTime(convertToCarTimeZoneISO(`${newStartDate}T${newStartTime}`, zipCode), zipCode);
    const formattedEndDate = formatDateAndTime(convertToCarTimeZoneISO(`${newEndDate}T${newEndTime}`, zipCode), zipCode);

    return (
        <div className='w-full space-y-2'>
            <p className='font-semibold text-14'>New Trip Summary</p>
            <div className='flex flex-col justify-center gap-3 rounded-lg bg-[#FAF7F7] p-2 '>
                <div className='flex w-full justify-between gap-2 p-4 pb-0'>
                    <p className='text-center text-14'>{splitFormattedDateAndTime(formattedStartDate)}</p>
                    <div className='whitespace-nowrap rounded-full bg-primary/60 p-2 px-2.5 font-semibold text-white'>To</div>
                    <p className='text-center text-14'>{splitFormattedDateAndTime(formattedEndDate)}</p>
                </div>

                {pricelist?.numberOfDays > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>Trip Duration</p>
                        <p className='text-14'>
                            {pricelist.numberOfDays} {pricelist.numberOfDays === 1 ? 'Day' : 'Days'}
                        </p>
                    </div>
                )}

                {pricelist?.charges > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>
                            Rental (${pricelist?.pricePerDay} X {pricelist?.numberOfDays}
                            {pricelist.numberOfDays === 1 ? 'Day' : 'Days'})
                        </p>
                        <p className='text-14'>${roundToTwoDecimalPlaces(pricelist?.charges)}</p>
                    </div>
                )}

                {(isAirportDeliveryChoosen || isCustomDeliveryChoosen) && (
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
                                            <div className='flex items-center justify-between'>
                                                <div className='text-14'>{isAirportDeliveryChoosen ? 'Airport Delivery fee' : 'Custom Delivery fee'}</div>
                                                <div className='font-medium text-14'>${roundToTwoDecimalPlaces(pricelist?.delivery)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='font-medium text-14'>${roundToTwoDecimalPlaces(pricelist?.delivery)}</div>
                    </div>
                )}

                {pricelist?.numberOfDaysDiscount > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2 '>
                        <div className='flex items-center gap-1 text-xs'>
                            <p className='text-14'>Discount</p>
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' flex h-fit w-fit items-center p-0' type='button'>
                                            <IoInformationCircleOutline className='size-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-68'>
                                        <div className='grid select-none gap-4'>
                                            <div className='space-y-2'>
                                                <p className='font-medium leading-none'>Discount</p>
                                            </div>
                                            <div className='space-y-1'>
                                                {pricelist?.discountAmount > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>
                                                            {pricelist?.numberOfDaysDiscount} Day Discount applied -
                                                            {roundToTwoDecimalPlaces(pricelist?.discountPercentage)} %
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='font-medium text-14 text-green-500'>${roundToTwoDecimalPlaces(pricelist?.discountAmount)}</div>
                    </div>
                )}

                {pricelist?.upcharges > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>Short notice rental fee</p>
                        <p className='text-14'>${pricelist?.upcharges}</p>
                    </div>
                )}

                {(pricelist?.tripFee > 0 || pricelist?.concessionFee > 0 || pricelist?.statesurchargeamount > 0 || pricelist?.registrationRecoveryFee > 0) && (
                    <div className='flex items-center justify-between gap-2 px-2 '>
                        <div className='flex items-center gap-1'>
                            <p className='text-14'>Trip Fee</p>
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' flex h-fit w-fit items-center p-0' type='button'>
                                            <IoInformationCircleOutline className='size-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-64'>
                                        <div className='grid select-none gap-4'>
                                            <div className='space-y-2'>
                                                <p className='font-medium leading-none'>Trip Fee</p>
                                            </div>
                                            <div className='space-y-1'>
                                                {pricelist?.concessionCalculated > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>Airport concession recovery fee</div>
                                                        <div className='font-medium text-14'>${roundToTwoDecimalPlaces(pricelist?.concessionCalculated)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.stateSurchargeAmount > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>State Surcharge </div>
                                                        <div className='font-medium text-14'>${roundToTwoDecimalPlaces(pricelist?.stateSurchargeAmount)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.registrationRecoveryFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>Vehicle licensing recovery fee </div>
                                                        <div className='font-medium text-14'>
                                                            ${roundToTwoDecimalPlaces(pricelist?.registrationRecoveryFee)}
                                                        </div>
                                                    </div>
                                                )}

                                                {pricelist?.tripFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-14'>Platform fee </div>
                                                        <div className='font-medium text-14'>${roundToTwoDecimalPlaces(pricelist?.tripFee)}</div>
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
                                pricelist?.concessionFee + pricelist?.stateSurchargeAmount + pricelist?.registrationRecoveryFee + pricelist?.tripFee
                            )}
                        </div>
                    </div>
                )}

                {pricelist?.taxAmount > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p className='text-14'>Sales Taxes ({pricelist?.taxPercentage}%)</p>
                        <p className='text-14'>${roundToTwoDecimalPlaces(pricelist?.taxAmount)}</p>
                    </div>
                )}

                {pricelist?.tripTaxAmount > 0 && (
                    <div className='flex w-full items-center justify-between border-black/40 border-t px-2 pt-2'>
                        <p className='font-bold text-14'> New Rental Charges</p>
                        <p className='font-bold text-14'>${roundToTwoDecimalPlaces(pricelist?.tripTaxAmount)}</p>
                    </div>
                )}

                <div className='flex w-full items-center justify-between border-black/40 border-t px-2 pt-2'>
                    <p className='font-bold text-14'>Trip Cost Difference</p>
                    <p className='font-bold text-14'>
                        {Math.round(differenceAmount) === 0 ? '' : isExtension ? '+' : '-'} $
                        {Math.abs(Number(roundToTwoDecimalPlaces(Number(differenceAmount))))}
                    </p>
                </div>
            </div>
        </div>
    );
}
