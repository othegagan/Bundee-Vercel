import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';

const PriceDisplayComponent = ({ pricelist, isAirportDeliveryChoosen }: { pricelist: any; isAirportDeliveryChoosen: boolean }) => {
    return (
        <div>
            <div className='w-full space-y-1 '>
                {pricelist?.charges > 0 && (
                    <div className='flex items-center justify-between'>
                        <div>
                            Rental (${pricelist?.pricePerDay} X {pricelist?.numberOfDays} {pricelist?.numberOfDays === 1 ? 'day' : 'days'})
                        </div>
                        <div className=' font-medium'>${roundToTwoDecimalPlaces(pricelist?.charges)}</div>
                    </div>
                )}

                {pricelist?.numberOfDaysDiscount > 0 && pricelist?.discountAmount > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className=' flex items-center gap-1'>
                            Discount
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' h-fit w-fit p-1' type='button'>
                                            <IoInformationCircleOutline className='h-5 w-5 text-neutral-600' />
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
                                                        <div className='text-sm'>
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
                        <div className=' font-medium text-green-500'>${roundToTwoDecimalPlaces(pricelist?.discountAmount)}</div>
                    </div>
                )}

                {pricelist?.delivery > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className=' flex items-center gap-1'>
                            Additional services chosen
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' h-fit w-fit p-1' type='button'>
                                            <IoInformationCircleOutline className='h-5 w-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80'>
                                        <div className='grid select-none gap-4'>
                                            <p className='font-medium leading-none'> Additional services chosen</p>
                                            <div className='space-y-1'>
                                                {pricelist?.delivery > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-sm'>
                                                            {isAirportDeliveryChoosen ? 'Airport Delivery Fee' : 'Custom Delivery Fee'}
                                                        </div>
                                                        <div className='text-sm font-medium'>${roundToTwoDecimalPlaces(pricelist?.delivery)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className=' font-medium'>${roundToTwoDecimalPlaces(pricelist?.delivery)}</div>
                    </div>
                )}

                {pricelist?.upcharges > 0 && (
                    <div className='flex items-center justify-between'>
                        <div>Short notice rental fee</div>
                        <div className=' font-medium'>${roundToTwoDecimalPlaces(pricelist?.upcharges)}</div>
                    </div>
                )}

                {pricelist?.tripFee > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className=' flex items-center gap-1'>
                            Trip Fee
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' h-fit w-fit p-1' type='button'>
                                            <IoInformationCircleOutline className='h-5 w-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80'>
                                        <div className='grid select-none gap-4'>
                                            <div className='space-y-2'>
                                                <p className='font-medium leading-none'>Trip Fee</p>
                                            </div>
                                            <div className='space-y-1'>
                                                {pricelist?.concessionFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-sm'>Airport concession recovery fee</div>
                                                        <div className='text-sm font-medium'>${roundToTwoDecimalPlaces(pricelist?.concessionFee)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.stateSurchargeAmount > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-sm'>State Surcharge </div>
                                                        <div className='text-sm font-medium'>${roundToTwoDecimalPlaces(pricelist?.stateSurchargeAmount)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.registrationRecoveryFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                        <div className='text-sm font-medium'>
                                                            ${roundToTwoDecimalPlaces(pricelist?.registrationRecoveryFee)}
                                                        </div>
                                                    </div>
                                                )}

                                                {pricelist?.tripFee > 0 && (
                                                    <div className='flex items-center justify-between'>
                                                        <div className='text-sm'>Platform fee </div>
                                                        <div className='text-sm font-medium'>${roundToTwoDecimalPlaces(pricelist?.tripFee)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className=' font-medium'>
                            $
                            {roundToTwoDecimalPlaces(
                                pricelist.concessionFee + pricelist.stateSurchargeAmount + pricelist.registrationRecoveryFee + pricelist?.tripFee,
                            )}
                        </div>
                    </div>
                )}

                {pricelist?.taxAmount > 0 && (
                    <div className='flex items-center justify-between'>
                        <div>Sales Taxes ({roundToTwoDecimalPlaces(pricelist?.taxPercentage)}%)</div>
                        <div className=' font-medium'>${roundToTwoDecimalPlaces(pricelist?.taxAmount)}</div>
                    </div>
                )}

                <hr />

                {pricelist?.tripTaxAmount > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className=' font-bold'>Total Rental Charge</div>
                        <div className='  font-bold'>${roundToTwoDecimalPlaces(pricelist?.tripTaxAmount)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceDisplayComponent;
