import { checkForNotifications, getAllNotifications, markNotificationAsRead } from '@/server/notifications';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePaginatedNotifications() {
    return useInfiniteQuery({
        queryKey: ['allNotifications'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getAllNotifications(pageParam);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
        },
        initialPageParam: 1
    });
}

export const useCheckNotifications = () => {
    return useQuery({
        queryKey: ['checkNotifications'],
        refetchOnWindowFocus: true,
        refetchInterval: 7000,
        queryFn: async () => {
            const response = await checkForNotifications();
            return response;
        }
    });
};

export const useMarkNotificationAsRead = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await markNotificationAsRead(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
        }
        // onError: () => {}
    });
};
