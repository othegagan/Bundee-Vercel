import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AddressSearchBox from './AddressSearchBox';

interface DeliveryDetailsComponentProps {
    businessConstraints: any;

    isAirportDeliveryChoosen: boolean;
    setIsAirportDeliveryChoosen: any;

    isCustoumDeliveryChoosen: boolean;
    setIsCustoumDeliveryChoosen: any;

    customDeliveryLocation: string;
    setCustomDeliveryLocation: any;

    city: string | null | undefined;
}

export default function DeliveryDetailsComponent({
    businessConstraints,
    isAirportDeliveryChoosen,
    setIsAirportDeliveryChoosen,
    isCustoumDeliveryChoosen,
    setIsCustoumDeliveryChoosen,
    customDeliveryLocation,
    setCustomDeliveryLocation,
    city
}: DeliveryDetailsComponentProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showAirportDetails, setShowAirportDetails] = useState(false);

    const deliveryDetails = extractFirstDeliveryDetails(businessConstraints);

    function extractFirstDeliveryDetails(constraintsArray) {
        const firstDeliveryDetails = constraintsArray.find((constraint) => constraint.constraintName === 'DeliveryDetails');
        if (firstDeliveryDetails) {
            return JSON.parse(firstDeliveryDetails.constraintValue);
        }
        return null;
    }

    function handleDeliverySelection(type) {
        if (type === 'custom' && isAirportDeliveryChoosen) {
            toast.error('You have already chosen airport delivery. Please uncheck it to choose custom delivery.');
            return;
        }

        if (type === 'airport' && isCustoumDeliveryChoosen) {
            toast.error('You have already chosen custom delivery. Please uncheck it to choose airport delivery.');
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
        setIsCustoumDeliveryChoosen((prev) => !prev);
        setIsAirportDeliveryChoosen(false);
    }

    function handleAirportDeliveryCheckbox() {
        setIsAirportDeliveryChoosen((prev) => !prev);
        setIsCustoumDeliveryChoosen(false);
    }

    if (!deliveryDetails) return null;

    return (
        <div className='flex w-full flex-2 flex-col gap-2 '>
            <div className='flex flex-col gap-5'>
                <DeliveryOption
                    label='Do you need Custom delivery?'
                    appliedLabel='Custom delivery Charges applied'
                    isSelected={isCustoumDeliveryChoosen}
                    showDetails={showDetails}
                    onToggle={() => handleDeliverySelection('custom')}
                    checkboxId='custom'
                    onCheckboxChange={handleCustomDeliveryCheckbox}
                    checkboxChecked={isCustoumDeliveryChoosen}
                    costLabel={`$${deliveryDetails.nonAirportDeliveryCost} will be applied for custom delivery`}
                    additionalContent={
                        isCustoumDeliveryChoosen && (
                            <>
                                <p className='my-2 font-bold text-xs'>Delivery Location</p>
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
                        additionalContent={<p className='my-1 font-bold text-xs'>Delivery Location: {city}</p>}
                    />
                )}
            </div>
        </div>
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
        <button type='button' className='flex w-full cursor-pointer select-none items-center justify-between' onClick={onToggle}>
            <p className={`flex items-center font-medium ${isSelected ? 'text-green-500' : 'text-primary'}`}>{isSelected ? appliedLabel : label}</p>
            <ChevronDown className={`ml-auto size-5 text-neutral-500 ${showDetails ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        {showDetails && (
            <div className='flex flex-col gap-3 py-2'>
                <CheckboxWithLabel id={checkboxId} checked={checkboxChecked} onChange={onCheckboxChange} label={costLabel} />
                {additionalContent}
            </div>
        )}
    </div>
);

const CheckboxWithLabel = ({ id, checked, onChange, label }) => (
    <div className='flex select-none gap-3'>
        <label htmlFor={id} className='flex cursor-pointer items-center gap-2'>
            <input id={id} type='checkbox' className='h-5 w-5' checked={checked} onChange={onChange} />
            <div className='flex items-center gap-2 text-neutral-500 text-sm'>
                <span className='font-bold'>{label}</span>
            </div>
        </label>
    </div>
);
