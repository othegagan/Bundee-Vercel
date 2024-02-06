import { BellIcon } from '@heroicons/react/24/outline';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import { updateUserNotifications } from '@/app/_actions/update_all_notifications';
import { getAllNotifications } from '@/app/_actions/get_all_notifications';

export default function NotificationPopoverItem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notificationsData, setNotificationsData] = useState([]);
    const [notReadMessages, setNotReadMessages] = useState([]);

    useEffect(() => {
        const getInitialNotifications = async () => {
            await getNotifications();
        };

        getInitialNotifications();
    }, []);

    const getNotifications = async () => {
        setLoading(true);
        setError(null);

        const user = localStorage.getItem('session_user');

        if (user) {
            const id = localStorage.getItem('userId');
            const auth_token = localStorage.getItem('auth_token_login');
            if (id) {
                try {
                    const data = await getAllNotifications(id, auth_token);
                    setNotificationsData(data);

                    const unReadMessages = data.filter(item => item.viewed === false);
                    setNotReadMessages(unReadMessages);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('An error occurred while fetching data.');
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const markAsRead = async () => {
        const unReadMessagesIds = String(notReadMessages.map(item => item.id).join(','));
        setError(null);

        const user = localStorage.getItem('session_user');

        if (user) {
            const id = localStorage.getItem('userId');
            const auth_token = localStorage.getItem('auth_token_login');
            if (id && auth_token) {
                try {
                    const data = await updateUserNotifications(unReadMessagesIds, auth_token);
                    getNotifications();
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('An error occurred while fetching data.');
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative px-2' onClick={getNotifications}>
                        <BellIcon className='h-6 w-6 text-gray-600 group-hover:text-neutral-800' aria-hidden='true' />
                        {notReadMessages.length > 0 ? <div className='absolute inline-flex items-center justify-center w-6 h-6  font-medium text-white bg-primary border-2 border-white rounded-full -top-1 -end-1  text-[9px]'>{notReadMessages.length}</div> : null}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-[310px] '>
                    <div className='flex justify-between gap-3 p-1 mt-1'>
                        <p className='font-bold text-sm text-foreground'>Notifications</p>
                        {!loading && notReadMessages.length > 0 && (
                            <div className='text-xs text-muted-foreground select-none cursor-pointer' onClick={markAsRead}>
                                Mark all as read
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className='flex flex-col gap-2 px-2'>
                            <Skeleton className='w-3/4 h-4 rounded-md bg-neutral-300' />
                            <Skeleton className='w-1/2 h-4 rounded-md bg-neutral-300' />
                        </div>
                    )}

                    {error && <p className='text-xs text-center my-3'>{error}</p>}

                    {!loading && notificationsData && notificationsData.length === 0 && (
                        <div className='flex flex-col gap-2'>
                            <p className='text-xs text-center my-3'>No notifications yet</p>
                        </div>
                    )}

                    {notificationsData && notificationsData.length > 0 && (
                        <ScrollArea className='max-h-60 w-[300px] flex flex-col  rounded-lg p-1  border-1 select-none'>
                            {notificationsData.map(item => (
                                <div key={item.id} className=' rounded-md border w-full my-1 px-2 py-1 hover:bg-gray-50 '>
                                    <p className='font-medium text-sm text-foreground '>
                                        {item.branchResponses[0]?.make} {item.branchResponses[0]?.model} {item.branchResponses[0]?.year}
                                        {item.viewed === false && <span className='  ml-2 -mt-1  bg-green-100 text-green-800 text-[10px] font-normalme-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300'>New</span>}
                                    </p>

                                    <p className='font-normal text-xs text-muted-foreground '>{item.message}</p>
                                </div>
                            ))}
                        </ScrollArea>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
