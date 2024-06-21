import { getTripDetailsbyId } from '@/server/tripOperations';
import { useQuery } from '@tanstack/react-query';

export const useTripDetails = (tripId: number | string) => {
    return useQuery({
        queryKey: ['tripDetails', { tripId }],
        queryFn: async () => getTripDetailsbyId(Number(tripId)),
        refetchOnWindowFocus: true,
        staleTime: 30 * 1000,
    });
};
