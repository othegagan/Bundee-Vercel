import { Textarea } from '@/components/ui/textarea';
import { toTitleCase } from '@/lib/utils';
import { useState } from 'react';
import { FaChevronDown, FaLocationDot } from 'react-icons/fa6';

const DeliveryDetailsComponent = ({
    vehicleBusinessConstraints,
    vehicleDetails,
    isAirport,
    setIsAirport,
    isCustoumDelivery,
    setIsCustoumDelivery,
    city,
    setCustomDeliveryLocation,
    customDeliveryLocation,
}) => {
    const [airportCheckbox, setAirportCheckbox] = useState(isAirport);
    const [customCheckbox, setCustomCheckbox] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

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

    const handleCheckboxToggle1 = () => {
        setAirportCheckbox(!airportCheckbox);
        setIsAirport(!isAirport);
    };

    const handleCheckboxToggle2 = () => {
        setCustomCheckbox(!customCheckbox);
        setIsCustoumDelivery(!isCustoumDelivery);
        setCustomDeliveryLocation('');
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
                <>
                    <div
                        className='flex justify-between border border-gray-200 w-full px-3 py-2 rounded-md cursor-pointer'
                        onClick={() => {
                            setShowDetails(!showDetails);
                        }}>
                        {!deliveryDetails?.deliveryToAirport ? (
                            <>
                                {customCheckbox ? (
                                    <p className='flex text-green-500 font-medium items-center text-sm   '>Custom delivery Charges applied</p>
                                ) : (
                                    <p className='flex text-primary font-medium items-center text-sm   '>Do you need Custom delivery?</p>
                                )}
                            </>
                        ) : null}

                        {deliveryDetails?.deliveryToAirport ? <p className='flex text-green-500 font-medium items-center text-sm   '>Airport delivery Charges applied</p> : null}
                        <FaChevronDown className={`text-neutral-500   ${showDetails ? 'rotate-180' : ' rotate-0'}`} />
                    </div>

                    {showDetails && (
                        <>
                            <>
                                {deliveryDetails?.deliveryToAirport ? (
                                    <>
                                        <div className='px-3 py-2 border rounded-md flex flex-col gap-3 my-4'>
                                            <div className='flex gap-3'>
                                                <input type='checkbox' className='h-5 w-5' checked={isAirport} readOnly />
                                                <p className='text-sm text-neutral-500'>
                                                    <span className='font-bold'> $ {deliveryDetails?.airportDeliveryCost}</span> as be applied for airport delivery
                                                </p>
                                            </div>
                                            <>
                                                <p className='text-xs my-1 font-bold '>Delivery Location</p>
                                                <Textarea rows={3} placeholder='Enter Location' value={city} onChange={e => setCustomDeliveryLocation(e.target.value)} />
                                            </>
                                        </div>
                                    </>
                                ) : null}
                            </>

                            <>
                                {!deliveryDetails?.deliveryToAirport ? (
                                    <div className='px-3 py-2 border rounded-md flex flex-col gap-3 my-4'>
                                        <div className='flex gap-3'>
                                            <input type='checkbox' className='h-5 w-5' checked={customCheckbox} onChange={handleCheckboxToggle2} />
                                            <p className='text-sm text-neutral-500'>
                                                <span className='font-bold'>$ {deliveryDetails?.nonAirportDeliveryCost}</span> will be applied for custom delivery
                                            </p>
                                        </div>
                                        <div className={`${customCheckbox ? 'block' : 'hidden'}`}>
                                            <p className='text-xs my-2 font-bold '>Delivery Location</p>
                                            <Textarea rows={3} placeholder='Enter Location' value={city} onChange={e => setCustomDeliveryLocation(e.target.value)} />
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        </>
                    )}
                </>
            ) : null}
        </div>
    );
};

export default DeliveryDetailsComponent;
