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
                                    <div className='text-sm'>Rental Charges</div>
                                    <div className='text-sm font-medium'>$ {pricelist?.charges}</div>
                                </div>
                            )}
                            {pricelist?.numberOfDaysDiscount > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>
                                        {pricelist?.numberOfDaysDiscount} Day Discount of {pricelist?.discountPercentage} % applied
                                    </div>
                                    <div className='text-sm font-medium'>$ {pricelist?.discountAmount}</div>
                                </div>
                            )}

                            {pricelist?.delivery > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Delivery Charges</div>
                                    <div className='text-sm font-medium'>$ {pricelist?.delivery}</div>
                                </div>
                            )}

                            {pricelist?.upcharges > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Up Charges</div>
                                    <div className='text-sm font-medium'>$ {pricelist?.upcharges}</div>
                                </div>
                            )}
                            {pricelist?.tripFee > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Trip Charges</div>
                                    <div className='text-sm font-medium'>$ {pricelist?.tripFee}</div>
                                </div>
                            )}
                            {pricelist?.taxAmount > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-sm'>Taxes</div>
                                    <div className='text-sm font-medium'>$ {pricelist?.taxAmount}</div>
                                </div>
                            )}
                            <hr />
                            {pricelist?.tripTaxAmount > 0 && (
                                <div className='flex justify-between items-center'>
                                    <div className='text-md font-bold'>Trip Total</div>
                                    <div className='text-md font-bold'>$ {pricelist?.tripTaxAmount}</div>
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
