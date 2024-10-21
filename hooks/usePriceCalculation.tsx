import { convertToCarTimeZoneISO } from '@/lib/utils';
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
    zipCode: string | null;
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
    hostId,
    zipCode
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
                    startTime: convertToCarTimeZoneISO(`${startDate}T${startTime}`, zipCode),
                    endTime: convertToCarTimeZoneISO(`${endDate}T${endTime}`, zipCode),
                    airportDelivery: isAirportDelivery,
                    customDelivery: isCustomDelivery,
                    hostid: hostId,
                    tripid: 0
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
