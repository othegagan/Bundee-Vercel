import { useEffect, useState } from 'react';
import { getAvailabilityDatesByVehicleId } from '@/app/_actions/get_availability_dates_by_vehicle_id';

const useAvailabilityDates = (vehicleId: any) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [minDays, setMinDays] = useState(0);
    const [maxDays, setMaxDays] = useState(0);

    const token = localStorage.getItem('auth_token_login') || '';

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result: any = await getAvailabilityDatesByVehicleId({ vehicleid: vehicleId }, token);
            setData(result);
            if (result) {
                const bloackedDates = convertDates(result.unAvailabilityDate);
                setUnavailableDates(bloackedDates || []);
                const vehicleBusinessConstraints = result.vehicleBusinessConstraints || [];
                const minMaxDays = vehicleBusinessConstraints.map((constraint: any) => {
                    const { maximumDays, minimumDays } = JSON.parse(constraint.constraintValue);
                    return { maximumDays, minimumDays };
                });
                const firstMinMax = minMaxDays.length > 0 ? minMaxDays[0] : {};
                setMinDays(firstMinMax?.minimumDays || 0);
                setMaxDays(firstMinMax?.maximumDays || 0);
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
