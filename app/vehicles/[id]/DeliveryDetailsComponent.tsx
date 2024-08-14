import { toast } from '@/components/ui/use-toast';
import { getFullAddress } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { FaLocationDot } from 'react-icons/fa6';
import AddressSearchBox from './AddressSearchBox';

export default function DeliveryDetailsComponent({
    vehicleBusinessConstraints,
    vehicleDetails,
    isCustoumDelivery,
    setIsCustoumDelivery,
    city,
    customDeliveryLocation,
    setCustomDeliveryLocation,
    isAirportDeliveryChoosen,
    setIsAirportDeliveryChoosen
}) {
    const [showDetails, setShowDetails] = useState(false);
    const [showAirportDetails, setShowAirportDetails] = useState(false);

    const deliveryDetails = extractFirstDeliveryDetails(vehicleBusinessConstraints);

    function extractFirstDeliveryDetails(constraintsArray) {
        const firstDeliveryDetails = constraintsArray.find((constraint) => constraint.constraintName === 'DeliveryDetails');
        if (firstDeliveryDetails) {
            return JSON.parse(firstDeliveryDetails.constraintValue);
        }
        return null;
    }

    function handleDeliverySelection(type) {
        if (type === 'custom' && isAirportDeliveryChoosen) {
            showToast('You have already chosen airport delivery.', 'Please uncheck it to choose custom delivery.');
            return;
        }

        if (type === 'airport' && isCustoumDelivery) {
            showToast('You have already chosen custom delivery.', 'Please uncheck it to choose airport delivery.');
            return;
        }

        if (type === 'custom') {
            setShowDetails((prev) => !prev);
            setShowAirportDetails(false);
        } else {
            setShowAirportDetails((prev) => !prev);
            setShowDetails(false);
        }
    }

    function handleCustomDeliveryCheckbox() {
        setIsCustoumDelivery((prev) => !prev);
        setIsAirportDeliveryChoosen(false);
    }

    function handleAirportDeliveryCheckbox() {
        setIsAirportDeliveryChoosen((prev) => !prev);
        setIsCustoumDelivery(false);
    }

    function showToast(title, description) {
        toast({
            duration: 4000,
            variant: 'destructive',
            title,
            description
        });
    }

    return (
        <>
            <div className='flex w-full flex-col gap-2'>
                <label className='text-[15px] font-semibold'>Vehicle Location</label>
                <p className='text-14 flex items-center rounded-md border px-3 py-2'>
                    <FaLocationDot className='mr-2 size-5' />
                    {getFullAddress({ vehicleDetails })}
                </p>
            </div>

            {deliveryDetails && (
                <div className='flex flex-col gap-5'>
                    <DeliveryOption
                        label='Do you need Custom delivery?'
                        appliedLabel='Custom delivery Charges applied'
                        isSelected={isCustoumDelivery}
                        showDetails={showDetails}
                        onToggle={() => handleDeliverySelection('custom')}
                        checkboxId='custom'
                        onCheckboxChange={handleCustomDeliveryCheckbox}
                        checkboxChecked={isCustoumDelivery}
                        costLabel={`$${deliveryDetails.nonAirportDeliveryCost} will be applied for custom delivery`}
                        additionalContent={
                            isCustoumDelivery && (
                                <>
                                    <p className='my-2 text-xs font-bold'>Delivery Location</p>
                                    <AddressSearchBox setCustomDeliveryLocation={setCustomDeliveryLocation} />
                                </>
                            )
                        }
                    />

                    {deliveryDetails.deliveryToAirport && (
                        <DeliveryOption
                            label='Do you need Airport delivery?'
                            appliedLabel='Airport delivery Charges applied'
                            isSelected={isAirportDeliveryChoosen}
                            showDetails={showAirportDetails}
                            onToggle={() => handleDeliverySelection('airport')}
                            checkboxId='airport'
                            onCheckboxChange={handleAirportDeliveryCheckbox}
                            checkboxChecked={isAirportDeliveryChoosen}
                            costLabel={`$${deliveryDetails.airportDeliveryCost} will be applied for airport delivery`}
                            additionalContent={
                                <p className='my-1 text-xs font-bold'>Delivery Location: {city}</p>
                            }
                        />
                    )}
                </div>
            )}
        </>
    );
}

const DeliveryOption = ({
    label,
    appliedLabel,
    isSelected,
    showDetails,
    onToggle,
    checkboxId,
    onCheckboxChange,
    checkboxChecked,
    costLabel,
    additionalContent
}) => (
    <div className='w-full rounded-md border border-gray-200 px-3 py-2'>
        <button type='button' className='flex cursor-pointer select-none justify-between w-full items-center' onClick={onToggle}>
            <p className={`flex items-center font-medium ${isSelected ? 'text-green-500' : 'text-primary'}`}>
                {isSelected ? appliedLabel : label}
            </p>
            <ChevronDown className={`size-5 ml-auto text-neutral-500 ${showDetails ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        {showDetails && (
            <>
                <div className='flex flex-col gap-3 py-2'>
                    <CheckboxWithLabel
                        id={checkboxId}
                        checked={checkboxChecked}
                        onChange={onCheckboxChange}
                        label={costLabel}
                    />
                    {additionalContent}
                </div>
            </>
        )}
    </div>
);

const CheckboxWithLabel = ({ id, checked, onChange, label }) => (
    <div className='flex select-none gap-3'>
        <label htmlFor={id} className='flex cursor-pointer items-center gap-2'>
            <input id={id} type='checkbox' className='h-5 w-5' checked={checked} onChange={onChange} />
            <div className='flex items-center gap-2 text-sm text-neutral-500'>
                <span className='font-bold'>{label}</span>
            </div>
        </label>
    </div>
);
