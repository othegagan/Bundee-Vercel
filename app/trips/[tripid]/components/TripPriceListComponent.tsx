import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';

const TripPriceListComponent = ({ pricelist }: { pricelist: any }) => {
    // console.log(pricelist);
    return (
        <div>
            <div className='w-full space-y-1 '>
                {pricelist?.charges > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className='text-md'>
                            Rental (${pricelist?.perdayamount} X {pricelist?.totaldays} days)
                        </div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.charges)}</div>
                    </div>
                )}

                {pricelist?.numberOfDaysDiscount > 0 && pricelist?.discountAmount > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className='text-md flex items-center gap-1'>
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
                                                            {pricelist?.numberOfDaysDiscount} Day Discount applied -{' '}
                                                            {roundToTwoDecimalPlaces(pricelist?.discountPercentage)} %
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
                        <div className='text-md font-medium text-green-500'>$ {roundToTwoDecimalPlaces(pricelist?.discountAmount)}</div>
                    </div>
                )}

                {pricelist?.deliveryCost > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className='text-md flex items-center gap-1'>
                            <p>Additional services chosen</p>
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
                                            {pricelist?.deliveryCost > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>Custom Delivery fee</div>
                                                    <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.deliveryCost)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.deliveryCost)}</div>
                    </div>
                )}

                {pricelist?.upCharges > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className='text-md'>Short notice rental fee</div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.upCharges)}</div>
                    </div>
                )}

                {(pricelist?.tripFee > 0 || pricelist?.concessionFee > 0 || pricelist?.Statesurchargeamount > 0 || pricelist?.registrationRecoveryFee > 0) && (
                    <div className='flex items-center justify-between'>
                        <div className='text-md flex items-center gap-1'>
                            <p> Trip Fee</p>
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
                                                    <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.concessionFee)}</div>
                                                </div>
                                            )}

                                            {pricelist?.Statesurchargeamount > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>State Surcharge </div>
                                                    <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.Statesurchargeamount)}</div>
                                                </div>
                                            )}

                                            {pricelist?.registrationRecoveryFee > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                    <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.registrationRecoveryFee)}</div>
                                                </div>
                                            )}

                                            {pricelist?.tripFee > 0 && (
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>Platform fee </div>
                                                    <div className='text-sm font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.tripFee)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='text-md font-medium'>
                            ${' '}
                            {roundToTwoDecimalPlaces(
                                pricelist.concessionFee + pricelist.Statesurchargeamount + pricelist.registrationRecoveryFee + pricelist?.tripFee,
                            )}
                        </div>
                    </div>
                )}
                {pricelist?.taxAmount > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className='text-md'>Sales Taxes ({roundToTwoDecimalPlaces(pricelist?.taxPercentage * 100)}%)</div>
                        <div className='text-md font-medium'>$ {roundToTwoDecimalPlaces(pricelist?.taxAmount)}</div>
                    </div>
                )}
                <hr />
                {pricelist?.tripTaxAmount > 0 && (
                    <div className='flex items-center justify-between'>
                        <div className='text-md font-bold'>Total Rental Charge</div>
                        <div className='text-md  font-bold'>$ {roundToTwoDecimalPlaces(pricelist?.tripTaxAmount)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripPriceListComponent;
