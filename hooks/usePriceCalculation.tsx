import { calculatePrice } from '@/server/priceCalculation';
import { useEffect, useState } from 'react';

interface PriceCalculationInput {
    vehicleId: number;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    isAirportDelivery: boolean;
    isCustomDelivery: boolean;
    hostId: string | null;
}

interface PriceCalculationOutput {
    priceCalculatedList: any;
    deductionConfigData: any;
    isPriceError: boolean;
    priceErrorMessage: string | null;
    priceLoading: boolean;
}

const usePriceCalculation = ({
    vehicleId,
    startDate,
    startTime,
    endDate,
    endTime,
    isAirportDelivery,
    isCustomDelivery,
    hostId
}: PriceCalculationInput): PriceCalculationOutput => {
    const [priceCalculatedList, setPriceCalculatedList] = useState<any>(null);
    const [deductionConfigData, setDeductionConfigData] = useState<any>(null);
    const [isPriceError, setIsPriceError] = useState(false);
    const [priceErrorMessage, setPriceErrorMessage] = useState<string | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);

    useEffect(() => {
        const fetchPriceCalculation = async () => {
            try {
                setIsPriceError(false);
                setPriceLoading(true);
                const payload: any = {
                    vehicleid: vehicleId,
                    startTime: new Date(`${startDate}T${startTime}`).toISOString(),
                    endTime: new Date(`${endDate}T${endTime}`).toISOString(),
                    airportDelivery: isAirportDelivery,
                    customDelivery: isCustomDelivery,
                    hostid: hostId
                };

                const responseData: any = await calculatePrice(payload);

                if (responseData.success) {
                    const data = responseData.data;
                    setPriceCalculatedList(data.priceCalculatedList?.[0]);
                    setDeductionConfigData(data.deductionDetails?.[0]);
                } else {
                    setIsPriceError(true);
                    setPriceErrorMessage(responseData.message);
                }
            } catch (error) {
                console.log(error);
                setPriceErrorMessage(error.message);
                setIsPriceError(true);
            } finally {
                setPriceLoading(false);
            }
        };

        fetchPriceCalculation();
    }, [vehicleId, startDate, startTime, endDate, endTime, isAirportDelivery, isCustomDelivery, hostId]);

    return {
        priceCalculatedList,
        deductionConfigData,
        isPriceError,
        priceErrorMessage,
        priceLoading
    };
};

export default usePriceCalculation;
