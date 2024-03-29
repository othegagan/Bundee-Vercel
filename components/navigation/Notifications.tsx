'use client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import useTabFocusEffect from '@/hooks/useTabFocusEffect';
import { getAllNotifications, updateUserNotifications } from '@/server/notifications';
import { BellIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export default function NotificationsComponent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notificationsData, setNotificationsData] = useState([]);
    const [notReadMessages, setNotReadMessages] = useState([]);

    const getNotifications = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAllNotifications();
            if (response.success) {
                const responseData = response.data.inAppNotifications || [];
                setNotificationsData(responseData);

                const unReadMessages = responseData.filter(item => item.viewed === false);
                setNotReadMessages(unReadMessages);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('An error occurred while fetching notifications.');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        const unReadMessagesIds = String(notReadMessages.map(item => item.id).join(','));
        setError(null);

        try {
            await updateUserNotifications(unReadMessagesIds);
            getNotifications();
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('An error occurred while updating notifications.');
        }
    };

    useEffect(() => {
        getNotifications();
    }, []);

    useTabFocusEffect(getNotifications, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative px-2' onClick={getNotifications}>
                    <BellIcon className='h-6 w-6 text-gray-600 group-hover:text-neutral-800' aria-hidden='true' />
                    {notReadMessages.length > 0 && (
                        <div className='absolute -end-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-[9px] font-medium text-white'>
                            {notReadMessages.length}
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-[310px]'>
                <div className='mt-1 flex justify-between gap-3 p-1'>
                    <p className='text-sm font-bold text-foreground'>Notifications</p>
                    {!loading && notReadMessages.length > 0 && (
                        <div className='cursor-pointer select-none text-xs text-muted-foreground' onClick={markAsRead}>
                            Mark all as read
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className='flex flex-col gap-2 px-2'>
                        <Skeleton className='h-4 w-3/4 rounded-md bg-neutral-300' />
                        <Skeleton className='h-4 w-1/2 rounded-md bg-neutral-300' />
                    </div>
                ) : (
                    <>
                        {error && <p className='my-3 text-center text-xs'>{error}</p>}
                        {!error && notificationsData.length === 0 ? (
                            <div className='flex flex-col gap-2'>
                                <p className='my-3 text-center text-xs'>No notifications yet</p>
                            </div>
                        ) : (
                            <ScrollArea className='border-1 flex max-h-60 w-[300px] select-none flex-col rounded-lg p-1'>
                                {notificationsData.map(message => (
                                    <NotificationItem key={message.id} data={message} />
                                ))}
                            </ScrollArea>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NotificationItem({ data }) {
    return (
        <div className='my-1 w-full rounded-md border px-2 py-1 hover:bg-gray-50'>
            <p className='text-sm font-medium text-foreground'>
                {data.branchResponses[0]?.make} {data.branchResponses[0]?.model} {data.branchResponses[0]?.year}
                {data.viewed === false && (
                    <span className='font-normalme-2 -mt-1 ml-2 rounded bg-green-100 px-2.5 py-0.5 text-[10px] text-green-800 dark:bg-green-900 dark:text-green-300'>
                        New
                    </span>
                )}
            </p>
            <p className='text-xs font-normal text-muted-foreground'>{data.message}</p>
        </div>
    );
}
