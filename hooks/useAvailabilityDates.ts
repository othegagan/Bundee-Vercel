import { getAvailabilityDatesByVehicleId } from '@/app/_actions/get_availability_dates_by_vehicle_id';
import { useEffect, useState } from 'react';

const useAvailabilityDates = (vehicleId: any) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const token = localStorage.getItem('auth_token_login') || '';

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result: any = await getAvailabilityDatesByVehicleId({ vehicleid: vehicleId }, token);
            setData(result);
        } catch (error) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vehicleId]);

    const unavailableDates = data?.unAvailabilityDates || [];
    const vehicleBusinessConstraints = data?.vehicleBusinessConstraints || [];
    const minMaxDays = vehicleBusinessConstraints.map((constraint: any) => {
        const { maximumDays, minimumDays } = JSON.parse(constraint.constraintValue);
        return { maximumDays, minimumDays };
    });

    const firstMinMax = minMaxDays.length > 0 ? minMaxDays[0] : {};

    const minDays = firstMinMax?.minimumDays || 0;
    const maxDays = firstMinMax?.maximumDays || 0;

    return { data, isLoading, isError, unavailableDates, minDays, maxDays, refetch: fetchData };
};

export default useAvailabilityDates;
