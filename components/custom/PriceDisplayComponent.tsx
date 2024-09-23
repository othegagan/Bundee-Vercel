import { InvoiceHandlerComponent } from '@/app/trips/[tripId]/_components/DocumentHandlerComponent';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';

interface PriceDisplayComponentProps {
    pricelist: any;
    isAirportDeliveryChoosen: boolean;
    invoiceUrl?: string;
}

export default function PriceDisplayComponent({ pricelist, isAirportDeliveryChoosen, invoiceUrl }: PriceDisplayComponentProps) {
    return (
        <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
                <div className='font-bold text-md '>Payment</div>
                {invoiceUrl && <InvoiceHandlerComponent invoiceUrl={invoiceUrl} />}
            </div>

            <div className='w-full space-y-1'>
                {/* Rental Charges */}
                {pricelist?.charges > 0 && (
                    <PriceItem
                        label={`Rental ($${pricelist?.pricePerDay || pricelist?.perdayamount} x ${pricelist?.numberOfDays || pricelist?.totaldays} ${pricelist?.numberOfDays === 1 || pricelist?.totaldays === 1 ? 'day' : 'days'})`}
                        value={pricelist?.charges}
                    />
                )}

                {/* Discount */}
                {pricelist?.numberOfDaysDiscount > 0 && pricelist?.discountAmount > 0 && (
                    <PriceItem label='Discount' value={pricelist?.discountAmount}>
                        <InfoPopover
                            title='Discount'
                            content={
                                <div className='flex items-center justify-between'>
                                    <div className='text-sm'>
                                        {pricelist?.numberOfDaysDiscount} Day Discount applied -{roundToTwoDecimalPlaces(pricelist?.discountPercentage)} %
                                    </div>
                                    <div className='font-medium text-sm'>${roundToTwoDecimalPlaces(pricelist?.discountAmount)}</div>
                                </div>
                            }
                        />
                    </PriceItem>
                )}

                {/* Additional Services */}
                {(pricelist?.delivery > 0 || pricelist?.deliveryCost > 0) && (
                    <PriceItem label='Additional services chosen' value={pricelist?.delivery || pricelist?.deliveryCost}>
                        <InfoPopover
                            title='Additional services chosen'
                            content={
                                <div className='flex items-center justify-between'>
                                    <div className='text-sm'> {isAirportDeliveryChoosen ? 'Airport Delivery Fee' : 'Custom Delivery Fee'}</div>
                                    <div className='font-medium text-sm'>${roundToTwoDecimalPlaces(pricelist?.delivery || pricelist?.deliveryCost)}</div>
                                </div>
                            }
                        />
                    </PriceItem>
                )}

                {/* Short Notice Fee */}
                {pricelist?.upcharges > 0 && <PriceItem label='Short notice rental fee' value={pricelist?.upcharges} />}

                {/* Trip Fee */}
                {pricelist?.tripFee > 0 && (
                    <PriceItem
                        label='Trip Fee'
                        value={
                            pricelist?.concessionCalculated + pricelist?.Statesurchargeamount ||
                            pricelist?.stateSurchargeAmount + pricelist?.registrationRecoveryFee + pricelist?.tripFee
                        }>
                        <InfoPopover
                            title='Trip Fee'
                            content={
                                <>
                                    {pricelist?.concessionCalculated > 0 && (
                                        <div className='flex items-center justify-between'>
                                            <div className='text-sm'>Airport concession recovery fee</div>
                                            <div className='font-medium text-sm'>${roundToTwoDecimalPlaces(pricelist?.concessionCalculated)}</div>
                                        </div>
                                    )}

                                    {pricelist?.Statesurchargeamount > 0 ||
                                        (pricelist?.stateSurchargeAmount > 0 && (
                                            <div className='flex items-center justify-between'>
                                                <div className='text-sm'>State Surcharge </div>
                                                <div className='font-medium text-sm'>
                                                    ${roundToTwoDecimalPlaces(pricelist?.Statesurchargeamount || pricelist?.stateSurchargeAmount)}
                                                </div>
                                            </div>
                                        ))}

                                    {pricelist?.registrationRecoveryFee > 0 && (
                                        <div className='flex items-center justify-between'>
                                            <div className='text-sm'>Vehicle licensing recovery fee </div>
                                            <div className='font-medium text-sm'>${roundToTwoDecimalPlaces(pricelist?.registrationRecoveryFee)}</div>
                                        </div>
                                    )}

                                    {pricelist?.tripFee > 0 && (
                                        <div className='flex items-center justify-between'>
                                            <div className='text-sm'>Platform fee </div>
                                            <div className='font-medium text-sm'>${roundToTwoDecimalPlaces(pricelist?.tripFee)}</div>
                                        </div>
                                    )}
                                </>
                            }
                        />
                    </PriceItem>
                )}

                {/* Sales Taxes */}
                {pricelist?.taxAmount > 0 && (
                    <PriceItem label={`Sales Taxes (${roundToTwoDecimalPlaces(pricelist?.taxPercentage)}%)`} value={pricelist?.taxAmount} />
                )}

                {/* Extra Mileage Cost */}
                {pricelist?.extraMileageCost > 0 && (
                    <PriceItem label={`Extra mile cost (${roundToTwoDecimalPlaces(pricelist?.extraMilage)} miles)`} value={pricelist?.extraMileageCost} />
                )}

                {/* Late Fee */}
                {pricelist?.lateFee > 0 && <PriceItem label='Late Fee' value={pricelist?.lateFee} />}

                {/* Extra Day Charges */}
                {pricelist?.extraDayCharges > 0 && <PriceItem label='Extra Day charges' value={pricelist?.extraDayCharges} />}

                <hr />

                {/* Total Rental Charge */}
                {pricelist?.tripTaxAmount > 0 && (
                    <div className='flex items-center justify-between font-bold'>
                        <div>Total Rental Charge</div>
                        <div>${roundToTwoDecimalPlaces(pricelist?.tripTaxAmount)}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoPopover({ title, content }: { title: string; content: JSX.Element }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' className='h-fit w-fit p-1' aria-label={`More info about ${title}`}>
                    <IoInformationCircleOutline className='h-5 w-5 text-neutral-600' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80'>
                <div className='grid select-none gap-4'>
                    <p className='font-medium leading-none'>{title}</p>
                    <div className='space-y-1'>{content}</div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function PriceItem({ label, value, children }: { label: string; value: number; children?: JSX.Element }) {
    return (
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1'>
                {label}
                {children}
            </div>
            <div className={`font-medium ${label === 'Discount' && 'text-green-500'}`}>{value > 0 && `$${roundToTwoDecimalPlaces(value)}`}</div>
        </div>
    );
}
