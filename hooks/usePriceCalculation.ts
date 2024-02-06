import { useState } from 'react';
import { calculatePrice } from '@/app/_actions/calculatePrice';
import createDateTime from '@/lib/createDateTime';
import { format } from 'date-fns';

const usePriceCalculation = (pickupDate, pickupTime, dropDate, dropTime, params, vehicleHostDetails) => {
    const [isLoading, setIsLoading] = useState(false);
    const [priceData, setPriceData] = useState(null);
    const [deductionConfigData, setDeductionConfigData] = useState(null);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const getPriceCalculation = async () => {
        try {
            setIsLoading(true);
            const startDate = createDateTime(pickupDate, pickupTime);
            const endDate = createDateTime(dropDate, dropTime);

            const payload = {
                startTime: format(startDate, 'yyyy-MM-dd HH:mm'),
                vehicleId: Number(params.id),
                endTime: format(endDate, 'yyyy-MM-dd HH:mm'),
                airportDelivery: false,
                customDelivery: false,
                hostId: vehicleHostDetails?.hostID,
            };

            const authToken = localStorage.getItem('bundee_auth_token');
            const data = await calculatePrice(payload, authToken);

            if (data.errorcode === 0) {
                setPriceData(data.priceCalculatedList[0]);
                setDeductionConfigData(data.deductionDetails[0]);
            }
        } catch (error) {
            setHasError(true);
            setErrorMessage(error.message || 'An error occurred during price calculation.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        priceData,
        deductionConfigData,
        hasError,
        errorMessage,
        getPriceCalculation,
    };
};

export default usePriceCalculation;
