'use client';

import { ChatSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTripDetails } from '@/hooks/useTripDetails';
import { auth } from '@/lib/firebase';
import { formatDateAndTime, getFullAddress, sortImagesByIsPrimary } from '@/lib/utils';
import { getTripChatHistory, sendMessageToHost } from '@/server/tripOperations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const AUTHOR_TYPE = {
    SYSTEM: 'system',
    HOST: 'HOST',
    CLIENT: 'CLIENT'
};

export default function MessagePage({ params }) {
    const [token, setToken] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [tripId, setTripId] = useState(null);

    const chatWindowRef = useRef(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        async function fetchToken() {
            try {
                if (auth.currentUser) {
                    const idToken = await auth.currentUser.getIdToken();
                    setToken(idToken);
                    return idToken;
                }
            } catch (error) {
                console.error('Error retrieving token:', error);
                toast.error('Failed to retrieve token. Please reload the page and try again.');
            }
        }
        fetchToken();
    }, []);

    useEffect(() => {
        if (params.tripId) {
            setTripId(Number(params.tripId));
        }
    }, [params.tripId]);

    const { data: response } = useTripDetails(params.tripId);
    const tripData = response?.data?.activetripresponse[0];

    const fetchChatHistory = async () => {
        if (tripId && token) {
            return await getTripChatHistory(tripId, token);
        }
        return [];
    };

    const { data: messageList = [], isLoading: loadingMessages } = useQuery({
        queryKey: ['chatHistory', tripId, token],
        queryFn: fetchChatHistory,
        enabled: !!tripId && !!token,
        refetchInterval: 8000,
        refetchOnWindowFocus: true
    });

    const sendMessageMutation = useMutation({
        mutationFn: async () => {
            if (tripId && token && inputMessage) {
                return await sendMessageToHost(tripId, inputMessage, token);
            }
            throw new Error('Missing tripId, token, or inputMessage');
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['chatHistory', tripId, token] });
            setInputMessage('');
        },
        onError: (error) => {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        }
    });

    const handleSendMessage = (event) => {
        event.preventDefault();
        sendMessageMutation.mutate();
    };

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [sendMessageMutation.isPending]);

    return (
        <div className='rounded-lg text-card-foreground md:px-4 md:shadow-sm lg:border lg:pb-4'>
            <div className='h-[calc(90dvh-120px)] space-y-4 overflow-y-auto pt-2 lg:h-[calc(97dvh-180px)]' ref={chatWindowRef}>
                {loadingMessages ? (
                    <ChatSkeleton />
                ) : (
                    <>
                        {messageList.map((message, index) => (
                            <Message key={index} message={message} tripData={tripData} />
                        ))}
                    </>
                )}
            </div>
            <div className='flex items-center pt-3'>
                <form className='flex w-full items-center space-x-2' onSubmit={handleSendMessage}>
                    <Input
                        className=' flex-1 '
                        id='message'
                        placeholder='Type your message...'
                        autoComplete='off'
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <Button
                        variant='black'
                        type='submit'
                        disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                        loading={sendMessageMutation.isPending}
                        loadingText='Sending...'>
                        <Send className='mr-2 size-4' />
                        Send
                        <span className='sr-only'>Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}

function Message({ message, tripData }) {
    const authorImage = {
        [AUTHOR_TYPE.SYSTEM]: '/images/robot.png',
        [AUTHOR_TYPE.HOST]: tripData.hostImage || '/images/dummy_avatar.png'
    };

    const isClientMessage = message.author === AUTHOR_TYPE.CLIENT;

    const isHostMessage = message.author === AUTHOR_TYPE.HOST;

    const images = sortImagesByIsPrimary(tripData?.vehicleImages ?? []);

    if (isClientMessage) {
        return (
            <div className='ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg rounded-br-none bg-primary/40 px-3 py-2 font-medium text-sm'>
                {message?.message}
                <p className='flex items-center justify-end text-[10px] '> {format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
            </div>
        );
    }

    if (isHostMessage) {
        return (
            <div className='flex'>
                {message.author !== AUTHOR_TYPE.CLIENT && (
                    <img src={authorImage[message.author]} alt={message.author} width={32} height={32} className='mr-2 size-8 rounded-full border' />
                )}

                <div className='flex flex-col gap-2 rounded-lg rounded-tl-none bg-[#E1EFFE] px-3 py-2 font-medium text-sm'>
                    {message.message}
                    <p className='flex items-center justify-end text-[10px] text-black'>{format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex'>
            {message.author !== AUTHOR_TYPE.CLIENT && (
                <img src={authorImage[message.author]} alt={message.author} width={32} height={32} className='mr-2 size-8 rounded-full border' />
            )}

            {message.message.toLocaleLowerCase() === 'a new reservation was requested' ? (
                <div className='flex flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>
                    <span>{message.message}</span>

                    <div className=' embla__slide max-h-40 overflow-hidden rounded-md'>
                        <img
                            src={images[0]?.imagename || '/images/image_not_available.png'}
                            alt='image_not_found'
                            className='h-full w-full min-w-full rounded-md object-cover'
                        />
                    </div>

                    <p className='font-semibold text-16 capitalize '>
                        {tripData?.vehmake} {tripData?.vehmodel} {tripData?.vehyear}
                    </p>

                    <div className='text-12'>
                        Trip Start Date :<span className='font-medium text-gray-800'> {formatDateAndTime(tripData?.starttime, tripData?.vehzipcode)}</span>
                    </div>

                    <div className='text-12'>
                        Trip End Date : <span className='font-medium text-gray-800'> {formatDateAndTime(tripData?.endtime, tripData?.vehzipcode)}</span>
                    </div>

                    <div className='text-12'>
                        Pickup & Return :<span className='font-medium text-gray-800 capitalize'>{getFullAddress({ tripDetails: tripData })}</span>
                    </div>

                    <p className='flex items-center justify-end text-[10px] text-black'>{format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
                </div>
            ) : (
                <div className='flex flex-col gap-2 rounded-lg rounded-tl-none bg-muted px-3 py-2 font-medium text-sm'>
                    {message.message}
                    <p className='flex items-center justify-end text-[10px] text-black'>{format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
                </div>
            )}
        </div>
    );
}
