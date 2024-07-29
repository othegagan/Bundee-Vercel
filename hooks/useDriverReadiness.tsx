import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/server/userOperations';
import { useQuery } from '@tanstack/react-query';

export const useDriverReadiness = () => {
    return useQuery({
        queryKey: ['driverReadiness'],
        queryFn: async () => {
            const session = await getSession();
            return await getUserByEmail(session.email);
        },
        refetchOnWindowFocus: true,
        staleTime: 10 * 1000,
        gcTime: 10 * 1000,
    });
};
