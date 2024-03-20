import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';

const PriceDisplayComponent = ({ pricelist, isAirportDeliveryChoosen }: { pricelist: any; isAirportDeliveryChoosen: boolean }) => {
    return (
        <div>
            <div className='space-y-1 w-full '>
                {pricelist?.charges > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md'>
                            Rental (${pricelist?.pricePerDay} X {pricelist?.numberOfDays} {pricelist?.numberOfDays == 1 ? 'day' : 'days'})
                        </div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.charges)}</div>
                    </div>
                )}

                {pricelist?.numberOfDaysDiscount > 0 && pricelist?.discountAmount > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md flex items-center gap-1'>
                            Discount
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' w-fit p-1 h-fit' type='button'>
                                            <IoInformationCircleOutline className='w-5 h-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-68'>
                                        <div className='grid gap-4 select-none'>
                                            <div className='space-y-2'>
                                                <p className='font-medium leading-none'>Discount</p>
                                            </div>
                                            <div className='space-y-1'>
                                                {pricelist?.discountAmount > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>
                                                            {pricelist?.numberOfDaysDiscount} Day Discount applied - {roundToTwoDecimalPlaces(pricelist?.discountPercentage)} %
                                                        </div>
                                                        {/* <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.discountAmount)}</div> */}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='text-md font-medium text-green-500'>$ {roundToTwoDecimalPlaces(pricelist?.discountAmount)}</div>
                    </div>
                )}
                {pricelist?.delivery > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md flex items-center gap-1'>
                            Additional services chosen
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' w-fit p-1 h-fit' type='button'>
                                            <IoInformationCircleOutline className='w-5 h-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80'>
                                        <div className='grid gap-4 select-none'>
                                            <p className='font-medium leading-none'> Additional services chosen</p>
                                            <div className='space-y-1'>
                                                {pricelist?.delivery > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>{isAirportDeliveryChoosen ? 'Airport Delivery Fee' : 'Custom Delivery Fee'}</div>
                                                        <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.delivery)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.delivery)}</div>
                    </div>
                )}
                {pricelist?.upcharges > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md'>Short notice rental fee</div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.upcharges)}</div>
                    </div>
                )}
                {pricelist?.tripFee > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md flex items-center gap-1'>
                            Trip Fee
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' w-fit p-1 h-fit' type='button'>
                                            <IoInformationCircleOutline className='w-5 h-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80'>
                                        <div className='grid gap-4 select-none'>
                                            <div className='space-y-2'>
                                                <p className='font-medium leading-none'>Trip Fee</p>
                                            </div>
                                            <div className='space-y-1'>
                                                {pricelist?.concessionFee > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>Airport concession recovery fee</div>
                                                        <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.concessionFee)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.stateSurchargeAmount > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>State Surcharge </div>
                                                        <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.stateSurchargeAmount)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.registrationRecoveryFee > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                        <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.registrationRecoveryFee)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.tripFee > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>Platform fee </div>
                                                        <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.tripFee)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='text-md font-medium'>
                            $ {roundToTwoDecimalPlaces(pricelist.concessionFee + pricelist.stateSurchargeAmount + pricelist.registrationRecoveryFee + pricelist?.tripFee)}
                        </div>
                    </div>
                )}
                {pricelist?.taxAmount > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md'>Sales Taxes ({roundToTwoDecimalPlaces(pricelist?.taxPercentage * 100)}%)</div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.taxAmount)}</div>
                    </div>
                )}
                <hr />
                {pricelist?.tripTaxAmount > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-lg font-bold'>Total Rental Charge</div>
                        <div className='text-lg  font-bold'>$ {roundToTwoDecimalPlaces(pricelist?.tripTaxAmount)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceDisplayComponent;
