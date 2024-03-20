import { useEffect, useState } from 'react';
import useTabFocusEffect from './useTabFocusEffect';
import { getAvailabilityDatesByVehicleId } from '@/server/vehicleOperations';

const useAvailabilityDates = (vehicleId: any, tripid: any) => {
    const [data, setData] = useState(null);
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

                setData(data);
                const bloackedDates = convertDates(data.unAvailabilityDate);
                setUnavailableDates(bloackedDates || []);
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
    }, [vehicleId, tripid]);

    useTabFocusEffect(fetchData, [vehicleId, tripid]);

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

    return { data, isLoading, isError, unavailableDates, minDays, maxDays, refetch };
};

export default useAvailabilityDates;
