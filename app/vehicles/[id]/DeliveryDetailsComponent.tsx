import { toast } from '@/components/ui/use-toast';
import { toTitleCase } from '@/lib/utils';
import { useState } from 'react';
import { FaChevronDown, FaLocationDot } from 'react-icons/fa6';
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
    setIsAirportDeliveryChoosen,
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showAiprortDetails, setShowAiprortDetails] = useState(false);

    const deliveryDetails = extractFirstDeliveryDetails(vehicleBusinessConstraints);

    function extractFirstDeliveryDetails(constraintsArray) {
        const firstDeliveryDetails = constraintsArray.find(constraint => constraint.constraintName === 'DeliveryDetails');
        if (firstDeliveryDetails) {
            const { deliveryToAirport, airportDeliveryCost, nonAirportDeliveryCost } = JSON.parse(firstDeliveryDetails.constraintValue);

            return {
                deliveryToAirport,
                airportDeliveryCost,
                nonAirportDeliveryCost,
            };
        } else {
            return null;
        }
    }

    function checkWhichDeliveryIsChoosen(show) {
        if (show === 'custom') {
            if (isAirportDeliveryChoosen) {
                toast({
                    duration: 4000,
                    className: 'bg-red-300 text-white',
                    title: 'You have already choosen airport delivery.',
                    description: 'Please uncheck it to choose custom delivery.',
                });
                return;
            }
            setShowDetails(!showDetails);
            setShowAiprortDetails(false);
        } else {
            if (isCustoumDelivery) {
                toast({
                    duration: 4000,
                    className: 'bg-red-300 text-white',
                    title: 'You have already choosen custom delivery.',
                    description: 'Please uncheck it to choose airport delivery.',
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
        <div className=''>
            <div className='mb-4'>
                <label className='text-xs font-semibold mb-2'>Vehicle Location</label>

                <p className='flex  items-center text-sm border border-gray-200 px-3 py-2 rounded-md '>
                    <FaLocationDot className='text-primary w-5 h-5 mr-2 ' />

                    {toTitleCase(vehicleDetails?.address1)}
                    {vehicleDetails?.address2 ? ', ' + toTitleCase(vehicleDetails?.address2) : null}
                    {vehicleDetails?.zipcode ? ', ' + vehicleDetails?.zipcode : null}
                    {vehicleDetails?.cityname ? ', ' + toTitleCase(vehicleDetails?.cityname) : null}
                    {vehicleDetails?.state ? ', ' + toTitleCase(vehicleDetails.state) : null}
                </p>
            </div>

            {deliveryDetails ? (
                <div className='flex flex-col gap-5'>
                    <div className='border border-gray-200 w-full px-3 py-2 rounded-md '>
                        <div
                            className='flex select-none justify-between cursor-pointer '
                            onClick={() => {
                                checkWhichDeliveryIsChoosen('custom');
                            }}>
                            {deliveryDetails ? (
                                <>
                                    {isCustoumDelivery ? (
                                        <p className='flex text-green-500 font-medium items-center text-sm   '>Custom delivery Charges applied</p>
                                    ) : (
                                        <p className='flex text-primary font-medium items-center text-sm   '>Do you need Custom delivery?</p>
                                    )}
                                </>
                            ) : null}
                            <FaChevronDown className={`text-neutral-500   ${showDetails ? 'rotate-180' : ' rotate-0'}`} />
                        </div>

                        {showDetails && (
                            <>
                                <div className=' py-2 flex flex-col gap-3 '>
                                    <div className='flex gap-3 select-none'>
                                        <label htmlFor='custom' className='flex items-center gap-2 cursor-pointer'>
                                            <input id='custom' type='checkbox' className='h-5 w-5' checked={isCustoumDelivery} onChange={handleCustomDeliveryCheckbox} />
                                            <div className='text-sm text-neutral-500 flex items-center gap-2'>
                                                <span className='font-bold'>$ {deliveryDetails?.nonAirportDeliveryCost}</span> will be applied for custom delivery
                                            </div>
                                        </label>
                                    </div>
                                    <div className={`${isCustoumDelivery ? 'block' : 'hidden'}`}>
                                        <p className='text-xs my-2 font-bold '>Delivery Location</p>
                                        <AddressSearchBox setCustomDeliveryLocation={setCustomDeliveryLocation} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {deliveryDetails?.deliveryToAirport && (
                        <div className='border border-gray-200 w-full px-3 py-2 rounded-md '>
                            <div
                                className='flex select-none justify-between cursor-pointer '
                                onClick={() => {
                                    checkWhichDeliveryIsChoosen('airport');
                                }}>
                                {deliveryDetails?.deliveryToAirport ? (
                                    <>
                                        {isAirportDeliveryChoosen ? (
                                            <p className='flex text-green-500 font-medium items-center text-sm   '>Airport delivery Charges applied</p>
                                        ) : (
                                            <p className='flex text-primary font-medium items-center text-sm   '>Do you need Airport delivery?</p>
                                        )}
                                    </>
                                ) : null}
                                <FaChevronDown className={`text-neutral-500   ${showAiprortDetails ? 'rotate-180' : ' rotate-0'}`} />
                            </div>

                            {showAiprortDetails && (
                                <>
                                    {deliveryDetails?.deliveryToAirport ? (
                                        <>
                                            <div className=' py-2  flex flex-col gap-3 '>
                                                <div className='flex gap-3 select-none h-fit'>
                                                    <label htmlFor='airport' className='flex items-center gap-2 cursor-pointer'>
                                                        <input
                                                            id='airport'
                                                            type='checkbox'
                                                            className='h-5 w-5'
                                                            checked={isAirportDeliveryChoosen}
                                                            onChange={handleAirportDeliveryCheckbox}
                                                        />
                                                        <div className='text-sm text-neutral-500 flex items-center gap-2'>
                                                            <span className='font-bold'> $ {deliveryDetails?.airportDeliveryCost}</span> will be applied for airport delivery
                                                        </div>
                                                    </label>
                                                </div>

                                                <>
                                                    <p className='text-xs my-1 font-bold '>Delivery Location</p>
                                                    <p className='text-xs'>{city}</p>
                                                    {/* <Textarea rows={} placeholder='Enter Location' value={city} onChange={e => setCustomDeliveryLocation(e.target.value)} /> */}
                                                </>
                                            </div>
                                        </>
                                    ) : null}
                                </>
                            )}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default DeliveryDetailsComponent;
