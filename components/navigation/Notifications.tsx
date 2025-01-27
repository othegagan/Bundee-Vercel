'use client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCheckNotifications, usePaginatedNotifications } from '@/hooks/useNotifications';
import { markAllNotificationAsRead } from '@/server/notifications';
import { BellIcon } from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { type Key, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

export default function NotificationsComponent() {
    const { data: checkNotificationsData } = useCheckNotifications();
    const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error, refetch } = usePaginatedNotifications();

    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0); // Track scroll position

    const unReadNotifications = checkNotificationsData?.data?.hasNotification;

    const handleScroll = () => {
        if (!scrollRef.current || isLoading || !hasNextPage) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            fetchNextPage(); // Fetch the next page when the user scrolls near the bottom
        }

        // Save the current scroll position
        scrollPositionRef.current = scrollTop;
    };

    const notifications = data?.pages.flatMap((page) => page.inAppNotifications) || [];

    const groupedNotifications = notifications.reduce((acc: any, notification: any) => {
        const date = new Date(notification.createdDate).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(notification);
        return acc;
    }, {});

    async function handleMarkAllNotificationAsRead() {
        const response = await markAllNotificationAsRead();
        if (response.success) {
            refetch();
        } else {
            toast.error(response.message);
        }
    }

    // Restore scroll position after re-render
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollPositionRef.current;
        }
    }, [notifications]); // Restore scroll position when notifications change

    return (
        <DropdownMenu
            onOpenChange={(isOpen) => {
                if (isOpen) {
                    refetch();
                }
            }}>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative ml-0 px-2'>
                    <BellIcon className='size-6 text-muted-foreground' />
                    {unReadNotifications && (
                        <span className='absolute top-1 right-2 flex size-3'>
                            <span className='absolute inline-flex size-full rounded-full bg-primary ' />
                            <span className='relative inline-flex size-3 rounded-full bg-primary' />
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='flex h-full w-[310px] flex-col rounded-md drop-shadow-xl md:w-[400px]' align='end' alignOffset={-100}>
                <div className='mt-1 flex justify-between gap-3 p-1'>
                    <p className='font-bold text-foreground text-sm'>Notifications</p>
                    {unReadNotifications && (
                        <button type='button' className='relative px-2 text-xs' onClick={handleMarkAllNotificationAsRead}>
                            Mark All as Read
                        </button>
                    )}
                </div>

                {isLoading && !isFetchingNextPage && (
                    <div className='flex h-20 w-full flex-col items-center justify-center gap-2 px-2 text-muted-foreground text-sm'>
                        Loading Notifications...
                    </div>
                )}

                {error && <div className='flex h-20 items-center justify-center'>{error.message}</div>}

                {!isLoading && !error && notifications.length === 0 && <div className='flex h-20 items-center justify-center'>No notifications found.</div>}

                {!error && notifications.length > 0 && (
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className='flex h-[400px] select-none flex-col overflow-y-auto rounded-none border-1 md:w-full'>
                        {Object.keys(groupedNotifications).map((date: string, index: Key | null | undefined) => (
                            <div key={index} className='mb-2 max-w-5xl pt-1'>
                                <div className='sticky top-0 mb-2 flex items-center justify-between gap-4 bg-background'>
                                    <div className='h-1.5 w-full rounded-md bg-black/5' />
                                    <div className='w-fit whitespace-nowrap rounded-sm border border-black/20 bg-background p-3 py-1 text-center font-medium text-xs'>
                                        {format(new Date(date), 'eee PP')}
                                    </div>
                                    <div className='h-1.5 w-full rounded-md bg-black/5' />
                                </div>
                                {groupedNotifications[date].map((notification: any, index: Key | null | undefined) => (
                                    <NotificationItem key={index} data={notification} />
                                ))}
                            </div>
                        ))}

                        {isFetchingNextPage && (
                            <div className='my-5 flex h-20 w-full flex-col items-center justify-center gap-2 px-2 text-muted-foreground text-sm'>
                                Loading More...
                            </div>
                        )}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NotificationItem({ data }) {
    return (
        <Link href={`/trips/${data.tripId}/details`}>
            <div className='my-1 w-full rounded-md border px-2 py-1 hover:bg-gray-50'>
                <p className='flex flex-wrap items-center justify-between font-medium text-foreground text-sm'>
                    <div>
                        <span className='text-primary underline underline-offset-2'>
                            {data.branchResponses[0]?.make} {data.branchResponses[0]?.model} {data.branchResponses[0]?.year}
                        </span>
                        {data.viewed === false && (
                            <span className='-mt-1 ml-2 rounded bg-green-100 px-2.5 py-0.5 font-normalme-2 text-[10px] text-green-800 dark:bg-green-900 dark:text-green-300'>
                                New
                            </span>
                        )}
                    </div>

                    <span className='font-normal text-muted-foreground text-xs'>
                        {formatDistanceToNow(new Date(data.createdDate), { includeSeconds: false })} ago
                    </span>
                </p>
                <p className='mt-2 line-clamp-3 font-normal text-muted-foreground text-xs'>{data?.message}</p>
            </div>
        </Link>
    );
}
