import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IoInformationCircleOutline } from 'react-icons/io5';

const PriceDisplayComponent = ({ pricelist }: any) => {
    return (
        <div>
            <div className='space-y-1 w-full '>
                {pricelist?.charges > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md'>
                            Rental (${pricelist?.pricePerDay} X {pricelist?.numberOfDays} days)
                        </div>
                        <div className='text-md font-medium'>$ {parseFloat(pricelist?.charges.toString()).toFixed(2)}</div>
                    </div>
                )}

                {pricelist?.numberOfDaysDiscount > 0 && pricelist?.discountAmount > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md flex items-center gap-1'>
                            Discount
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' w-fit p-2' type='button'>
                                            <IoInformationCircleOutline className='w-5 h-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-68'>
                                        <div className='grid gap-4 select-none'>
                                            <div className='space-y-2'>
                                                <h4 className='font-medium leading-none'>Discount</h4>
                                            </div>
                                            <div className='space-y-1'>
                                                {pricelist?.discountAmount > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>
                                                            {pricelist?.numberOfDaysDiscount} Day Discount applied -{' '}
                                                            {parseFloat(pricelist?.discountPercentage.toString()).toFixed(1)} %
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
                        <div className='text-md font-medium text-green-500'>$ {pricelist?.discountAmount}</div>
                    </div>
                )}

                {pricelist?.delivery > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md flex items-center gap-1'>
                            Additional services chosen
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' w-fit p-2' type='button'>
                                            <IoInformationCircleOutline className='w-5 h-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80'>
                                        <div className='grid gap-4 select-none'>
                                            <h4 className='font-medium leading-none'> Additional services chosen</h4>
                                            <div className='space-y-1'>
                                                {pricelist?.delivery > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>Custom Delivery fee</div>
                                                        <div className='text-sm font-medium'>$ {parseFloat(pricelist?.delivery.toString()).toFixed(2)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='text-md font-medium'>$ {parseFloat(pricelist?.delivery.toString()).toFixed(2)}</div>
                    </div>
                )}

                {pricelist?.upcharges > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md'>Short notice rental fee</div>
                        <div className='text-md font-medium'>$ {parseFloat(pricelist?.upcharges.toString()).toFixed(2)}</div>
                    </div>
                )}

                {pricelist?.tripFee > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md flex items-center gap-1'>
                            Trip Fee
                            <span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='ghost' className=' w-fit p-2' type='button'>
                                            <IoInformationCircleOutline className='w-5 h-5 text-neutral-600' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80'>
                                        <div className='grid gap-4 select-none'>
                                            <div className='space-y-2'>
                                                <h4 className='font-medium leading-none'>Trip Fee</h4>
                                            </div>
                                            <div className='space-y-1'>
                                                {pricelist?.concessionFee > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>Airport concession recovery fee</div>
                                                        <div className='text-sm font-medium'>$ {parseFloat(pricelist?.concessionFee.toString()).toFixed(2)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.stateSurchargeAmount > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>State Surcharge </div>
                                                        <div className='text-sm font-medium'>$ {parseFloat(pricelist?.stateSurchargeAmount.toString()).toFixed(2)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.registrationRecoveryFee > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                        <div className='text-sm font-medium'>$ {parseFloat(pricelist?.registrationRecoveryFee.toString()).toFixed(2)}</div>
                                                    </div>
                                                )}

                                                {pricelist?.tripFee > 0 && (
                                                    <div className='flex justify-between items-center'>
                                                        <div className='text-sm'>Platform fee </div>
                                                        <div className='text-sm font-medium'>$ {parseFloat(pricelist?.tripFee.toString()).toFixed(2)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </span>
                        </div>
                        <div className='text-md font-medium'>
                            ${' '}
                            {parseFloat((pricelist.concessionFee + pricelist.stateSurchargeAmount + pricelist.registrationRecoveryFee + pricelist?.tripFee).toString()).toFixed(2)}
                        </div>
                    </div>
                )}
                {pricelist?.taxAmount > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-md'>Sales Taxes ({pricelist?.taxPercentage * 100}%)</div>
                        <div className='text-md font-medium'>$ {parseFloat(pricelist?.taxAmount.toString()).toFixed(2)}</div>
                    </div>
                )}
                <hr />
                {pricelist?.tripTaxAmount > 0 && (
                    <div className='flex justify-between items-center'>
                        <div className='text-lg font-bold'>Total Rental Charge</div>
                        <div className='text-lg  font-bold'>$ {parseFloat(pricelist?.tripTaxAmount.toString()).toFixed(2)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceDisplayComponent;
