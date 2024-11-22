import { getVehicleAllDetailsByVechicleId } from '@/server/vehicleOperations';
import { useQuery } from '@tanstack/react-query';
import { add, addDays, differenceInHours, format, isAfter, isBefore, parse, parseISO, set } from 'date-fns';

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

export function validateBookingTimeWithDelivery(bookingDateTime: string, isCustomDelivery: boolean, isAirportDelivery: boolean) {
    console.log(bookingDateTime, isCustomDelivery, isAirportDelivery);
    // Ensure delivery conditions apply
    if (isCustomDelivery || isAirportDelivery) {
        const timeFormat = 'h:mm aa';
        const dateTimeFormat = 'yyyy-MM-dd h:mm aa';

        // Define restricted range times
        const startOfRange = parse('7:00 PM', timeFormat, new Date());
        const endOfRange = add(parse('9:00 AM', timeFormat, new Date()), { days: 1 });

        // Parse given time
        const bookingTime = parse(bookingDateTime, dateTimeFormat, new Date());
        const now = new Date();

        // Adjust for times crossing midnight
        let adjustedBookingTime = bookingTime;
        if (bookingTime.getHours() < 12 && adjustedBookingTime.getHours() < 12) {
            adjustedBookingTime = add(adjustedBookingTime, { days: 1 });
        }

        // Additional condition: Check if pickup time is within 24 hours
        if (differenceInHours(bookingTime, now) < 24) {
            return {
                isValid: false,
                error: 'Vehicle delivery is not available for trips starting within 24 hours.'
            };
        }

        // Check if the booking time falls within the restricted range
        if ((isAfter(adjustedBookingTime, startOfRange) || isBefore(adjustedBookingTime, endOfRange)) && isCustomDelivery) {
            return {
                isValid: false,
                error: `Vehicle delivery is unavailable between ${format(startOfRange, 'h:mm aa')} and ${format(endOfRange, 'h:mm aa')}.`
            };
        }
    }

    return {
        isValid: true,
        error: ''
    };
}
