import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const PriceDisplayComponent = ({ pricelist }: any) => {
    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant='ghost' className='underline underline-offset-2 w-fit' type='button'>
                        See details
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                    <div className='grid gap-4 select-none'>
                        <div className='space-y-2'>
                            <h4 className='font-medium leading-none'>Price Breakdown</h4>
                            {/* <p className='text-sm text-muted-foreground'>Set the dimensions for the layer.</p> */}
                        </div>
                        <div className='space-y-1'>
                            {pricelist?.charges > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>
                                        Charges (${pricelist?.pricePerDay} X {pricelist?.numberOfDays} days)
                                    </div>
                                    <div className='text-sm font-medium'>$ {parseFloat(pricelist?.charges).toFixed(2)}</div>
                                </div>
                            )}
                            {pricelist?.numberOfDaysDiscount > 0 && pricelist?.discountAmount > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>
                                        Discount ({pricelist?.numberOfDaysDiscount} day rental - {pricelist?.discountPercentage} %)
                                    </div>
                                    <div className='text-sm font-medium text-green-500'>$ {pricelist?.discountAmount}</div>
                                </div>
                            )}

                            {pricelist?.delivery > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Delivery Charge</div>
                                    <div className='text-sm font-medium'>$ {parseFloat(pricelist?.delivery).toFixed(2)}</div>
                                </div>
                            )}

                            {pricelist?.upcharges > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Up Charge</div>
                                    <div className='text-sm font-medium'>$ {parseFloat(pricelist?.upcharges).toFixed(2)}</div>
                                </div>
                            )}
                            {pricelist?.tripFee > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Trip Charges</div>
                                    <div className='text-sm font-medium'>$ {parseFloat(pricelist?.tripFee).toFixed(2)}</div>
                                </div>
                            )}
                            {pricelist?.taxAmount > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Taxes ({pricelist?.taxPercentage * 100}%)</div>
                                    <div className='text-sm font-medium'>$ {parseFloat(pricelist?.taxAmount).toFixed(2)}</div>
                                </div>
                            )}
                            <hr />
                            {pricelist?.tripTaxAmount > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-md font-bold'>Total Rental Charge</div>
                                    <div className='text-md font-bold'>$ {parseFloat(pricelist?.tripTaxAmount).toFixed(2)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default PriceDisplayComponent;
