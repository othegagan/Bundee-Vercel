import { getVehicleAllDetailsByVechicleId } from '@/server/vehicleOperations';
import { useQuery } from '@tanstack/react-query';
import { addDays, format, isAfter, isBefore, parseISO, set } from 'date-fns';

export const useVehicleDetails = (vehicleId: number | string) => {
    return useQuery({
        queryKey: ['vehicleDetails', { vehicleId }],
        queryFn: async () => getVehicleAllDetailsByVechicleId(Number(vehicleId)),
        refetchOnWindowFocus: true,
        staleTime: 6 * 1000
    });
};

export function validateBookingTime(bookingDateTime: string) {
    // Convert input to Date object if string
    const bookingTime = typeof bookingDateTime === 'string' ? parseISO(bookingDateTime) : bookingDateTime;

    const now = new Date();
    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Set up time boundaries
    const todaySevenPM = set(today, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 });
    const tomorrowNoon = set(tomorrow, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
    const todayNoon = set(today, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });

    // If current time is after 7 PM
    if (isAfter(now, todaySevenPM)) {
        // No bookings allowed until next day noon
        if (isBefore(bookingTime, tomorrowNoon)) {
            return {
                isValid: false,
                error: `The trip can't start before ${format(tomorrowNoon, 'h:mm aa')} tomorrow due to car preparation time.`
            };
        }
    }
    // If current time is after midnight but before noon
    else if (isBefore(now, todayNoon) && now.getHours() < 12) {
        // No bookings allowed until today noon
        if (isBefore(bookingTime, todayNoon)) {
            return {
                isValid: false,
                error: `The trip can't start before ${format(tomorrowNoon, 'h:mm aa')} today due to car preparation time.`
            };
        }
    }

    return {
        isValid: true,
        error: 'Booking time is valid'
    };
}
