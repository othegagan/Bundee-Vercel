import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { convertToCarTimeZoneISO, formatDateAndTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';

export default function TripModificationPriceListComponent({ priceCalculatedList, zipCode, newStartDate, newEndDate, newStartTime, newEndTime }: any) {
    return (
        <div className='space-y-2'>
            <p className='flex  justify-between pt-1 text-xs text-gray-900'>
                Start Date :
                <span className='ml-2 '>
                    {newStartDate ? `${formatDateAndTime(convertToCarTimeZoneISO(newStartDate, newStartTime, zipCode), zipCode)}` : 'Dates not selected'}
                </span>
            </p>
            <p className='flex  justify-between pt-1 text-xs text-gray-900'>
                End Date :
                <span className='ml-2 '>
                    {newEndDate ? `${formatDateAndTime(convertToCarTimeZoneISO(newEndDate, newEndTime, zipCode), zipCode)}` : 'Dates not selected'}
                </span>
            </p>
            {priceCalculatedList?.numberOfDays > 0 && (
                <div className='flex items-center justify-between pt-1'>
                    <div className='text-xs'>Total Trip in days </div>
                    <div className='text-xs font-medium'>{priceCalculatedList.numberOfDays}</div>
                </div>
            )}

            {priceCalculatedList?.charges > 0 && (
                <div className='flex items-center justify-between pt-1'>
                    <div className='text-xs'>
                        Rental (${priceCalculatedList?.pricePerDay} X {priceCalculatedList?.numberOfDays} days)
                    </div>
                    <div className='text-xs font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.charges)}</div>
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
                                                <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.delivery)}</div>
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
                    <div className='text-xs font-medium text-green-500'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.discountAmount)}</div>
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
                                                    <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.concessionFee)}</div>
                                                </div>
                                            )}

                                            {priceCalculatedList?.stateSurchargeAmount > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>State Surcharge </div>
                                                    <div className='text-sm font-medium'>
                                                        $ {roundToTwoDecimalPlaces(priceCalculatedList?.stateSurchargeAmount)}
                                                    </div>
                                                </div>
                                            )}

                                            {priceCalculatedList?.registrationRecoveryFee > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                    <div className='text-sm font-medium'>
                                                        $ {roundToTwoDecimalPlaces(priceCalculatedList?.registrationRecoveryFee)}
                                                    </div>
                                                </div>
                                            )}

                                            {priceCalculatedList?.tripFee > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>Platform fee </div>
                                                    <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.tripFee)}</div>
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
                    <div className='text-xs'>Sales Taxes ({priceCalculatedList?.taxPercentage}%)</div>
                    <div className='text-xs font-medium'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.taxAmount)}</div>
                </div>
            )}
            <hr />

            {priceCalculatedList?.tripTaxAmount > 0 && (
                <div className='mb-6 flex items-center justify-between '>
                    <div className='text-sm font-semibold'>New Rental Charges</div>
                    <div className='text-sm  font-semibold'>$ {roundToTwoDecimalPlaces(priceCalculatedList?.tripTaxAmount)}</div>
                </div>
            )}
        </div>
    );
}
