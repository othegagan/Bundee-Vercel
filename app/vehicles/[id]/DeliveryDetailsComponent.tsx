import { toast } from '@/components/ui/use-toast';
import { getFullAddress } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { FaLocationDot } from 'react-icons/fa6';
import AddressSearchBox from './AddressSearchBox';

const DeliveryDetailsComponent = ({
    vehicleBusinessConstraints,
    vehicleDetails,
    isCustoumDelivery,
    setIsCustoumDelivery,
    city,
    customDeliveryLocation,
    setCustomDeliveryLocation,
    isAirportDeliveryChoosen,
    setIsAirportDeliveryChoosen
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showAiprortDetails, setShowAiprortDetails] = useState(false);

    const deliveryDetails = extractFirstDeliveryDetails(vehicleBusinessConstraints);

    function extractFirstDeliveryDetails(constraintsArray) {
        const firstDeliveryDetails = constraintsArray.find((constraint) => constraint.constraintName === 'DeliveryDetails');
        if (firstDeliveryDetails) {
            const { deliveryToAirport, airportDeliveryCost, nonAirportDeliveryCost } = JSON.parse(firstDeliveryDetails.constraintValue);

            return {
                deliveryToAirport,
                airportDeliveryCost,
                nonAirportDeliveryCost
            };
        }

        return null;
    }

    function checkWhichDeliveryIsChoosen(show) {
        if (show === 'custom') {
            if (isAirportDeliveryChoosen) {
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    title: 'You have already choosen airport delivery.',
                    description: 'Please uncheck it to choose custom delivery.'
                });
                return;
            }
            setShowDetails(!showDetails);
            setShowAiprortDetails(false);
        } else {
            if (isCustoumDelivery) {
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    title: 'You have already choosen custom delivery.',
                    description: 'Please uncheck it to choose airport delivery.'
                });
                return;
            }
            setShowAiprortDetails(!showAiprortDetails);
            setShowDetails(false);
        }
    }

    const handleCustomDeliveryCheckbox = () => {
        setIsCustoumDelivery(!isCustoumDelivery);
        setIsAirportDeliveryChoosen(false);
        setShowAiprortDetails(false);
    };

    const handleAirportDeliveryCheckbox = () => {
        setIsAirportDeliveryChoosen(!isAirportDeliveryChoosen);
        setIsCustoumDelivery(false);
        setShowDetails(false);
    };

    return (
        <>
            <div className='flex w-full flex-col gap-2'>
                <label className='text-[15px] font-semibold'>Vehicle Location</label>

                <p className='text-14 flex items-center rounded-md border px-3 py-2 '>
                    <FaLocationDot className='mr-2 size-5 ' />
                    {getFullAddress({ vehicleDetails: vehicleDetails })}
                </p>
            </div>

            {deliveryDetails ? (
                <div className='flex flex-col gap-5'>
                    <div className='w-full rounded-md border border-gray-200 px-3 py-2 '>
                        <button
                            type='button'
                            className='flex cursor-pointer select-none justify-between '
                            onClick={() => {
                                checkWhichDeliveryIsChoosen('custom');
                            }}>
                            {deliveryDetails ? (
                                <>
                                    {isCustoumDelivery ? (
                                        <p className='flex items-center  font-medium text-green-500   '>Custom delivery Charges applied</p>
                                    ) : (
                                        <p className='flex items-center  font-medium text-primary   '>Do you need Custom delivery?</p>
                                    )}
                                </>
                            ) : null}
                            <ChevronDown className={`text-neutral-500 ml-3  ${showDetails ? 'rotate-180' : ' rotate-0'}`} />
                        </button>

                        {showDetails && (
                            <>
                                <div className=' flex flex-col gap-3 py-2 '>
                                    <div className='flex select-none gap-3'>
                                        <label htmlFor='custom' className='flex cursor-pointer items-center gap-2'>
                                            <input
                                                id='custom'
                                                type='checkbox'
                                                className='h-5 w-5'
                                                checked={isCustoumDelivery}
                                                onChange={handleCustomDeliveryCheckbox}
                                            />
                                            <div className='flex items-center gap-2 text-sm text-neutral-500'>
                                                <span className='font-bold'>${deliveryDetails?.nonAirportDeliveryCost}</span> will be
                                                applied for custom delivery
                                            </div>
                                        </label>
                                    </div>
                                    <div className={`${isCustoumDelivery ? 'block' : 'hidden'}`}>
                                        <p className='my-2 text-xs font-bold '>Delivery Location</p>
                                        <AddressSearchBox setCustomDeliveryLocation={setCustomDeliveryLocation} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {deliveryDetails?.deliveryToAirport && (
                        <div className='w-full rounded-md border border-gray-200 px-3 py-2 '>
                            <button
                                type='button'
                                className='flex cursor-pointer select-none justify-between '
                                onClick={() => {
                                    checkWhichDeliveryIsChoosen('airport');
                                }}>
                                {deliveryDetails?.deliveryToAirport ? (
                                    <>
                                        {isAirportDeliveryChoosen ? (
                                            <p className='flex items-center  font-medium text-green-500   '>
                                                Airport delivery Charges applied
                                            </p>
                                        ) : (
                                            <p className='flex items-center  font-medium text-primary   '>Do you need Airport delivery?</p>
                                        )}
                                    </>
                                ) : null}
                                <ChevronDown className={`text-neutral-500  ml-3 ${showAiprortDetails ? 'rotate-180' : ' rotate-0'}`} />
                            </button>

                            {showAiprortDetails && (
                                <>
                                    {deliveryDetails?.deliveryToAirport ? (
                                        <>
                                            <div className=' flex  flex-col gap-3 py-2 '>
                                                <div className='flex h-fit select-none gap-3'>
                                                    <label htmlFor='airport' className='flex cursor-pointer items-center gap-2'>
                                                        <input
                                                            id='airport'
                                                            type='checkbox'
                                                            className='h-5 w-5'
                                                            checked={isAirportDeliveryChoosen}
                                                            onChange={handleAirportDeliveryCheckbox}
                                                        />
                                                        <div className='flex items-center gap-2 text-sm text-neutral-500'>
                                                            <span className='font-bold'> ${deliveryDetails?.airportDeliveryCost}</span> will
                                                            be applied for airport delivery
                                                        </div>
                                                    </label>
                                                </div>

                                                <p className='my-1 text-xs font-bold '>Delivery Location</p>
                                                <p className='text-xs'>{city}</p>
                                            </div>
                                        </>
                                    ) : null}
                                </>
                            )}
                        </div>
                    )}
                </div>
            ) : null}
        </>
    );
};

export default DeliveryDetailsComponent;
