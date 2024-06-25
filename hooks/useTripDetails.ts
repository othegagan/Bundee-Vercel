import { getTripDetailsbyId } from '@/server/tripOperations';
import { useQuery } from '@tanstack/react-query';

export const useTripDetails = (bookingid: number | string) => {
    return useQuery({
        queryKey: ['bookingDetails', { bookingid }],
        queryFn: async () => getTripDetailsbyId(Number(bookingid)),
        refetchOnWindowFocus: true,
        staleTime: 30 * 1000,
    });
};
