import { getAvailabilityDatesByVehicleId } from '@/server/vehicleOperations';
import { useEffect, useState } from 'react';
import useTabFocusEffect from './useTabFocusEffect';

const useAvailabilityDates = (vehicleId: any, tripid: any) => {
    const [unformattedDates, setUnformattedDates] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [minDays, setMinDays] = useState(0);
    const [maxDays, setMaxDays] = useState(0);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await getAvailabilityDatesByVehicleId(vehicleId, tripid);
            if (response.success) {
                const data = response.data;
                const bloackedDates = convertDates(data.unAvailabilityDate);
                setUnavailableDates(bloackedDates || []);
                setUnformattedDates(data.unAvailabilityDate);

                const vehicleBusinessConstraints = data.vehicleBusinessConstraints || [];
                const minMaxDays = vehicleBusinessConstraints.map((constraint: any) => {
                    const { maximumDays, minimumDays } = JSON.parse(constraint.constraintValue);
                    return { maximumDays, minimumDays };
                });

                const firstMinMax = minMaxDays.length > 0 ? minMaxDays[0] : {};
                setMinDays(firstMinMax?.minimumDays || 0);
                setMaxDays(firstMinMax?.maximumDays || 0);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vehicleId]);

    // useTabFocusEffect(fetchData, [vehicleId]);

    function convertDates(unAvailabilityDate: string[]): string[] {
        const result: string[] = [];

        for (const dateStr of unAvailabilityDate) {
            const currentDate = new Date(dateStr);
            currentDate.setDate(currentDate.getDate()); // Subtract one day

            const formattedDate = currentDate.toISOString().split('T')[0];
            result.push(formattedDate);
        }

        return result;
    }

    const refetch = fetchData;

    return { isLoading, isError, unavailableDates, minDays, maxDays, refetch, unformattedDates };
};

export default useAvailabilityDates;
