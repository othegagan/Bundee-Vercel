'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import EmblaCarousel from '@/components/ui/carousel/EmblaCarousel';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useTripDetails } from '@/hooks/useTripDetails';
import { auth } from '@/lib/firebase';
import { formatDateAndTime } from '@/lib/utils';
import { getTripChatHistory, sendMessageToHost } from '@/server/tripOperations';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ChatSkeleton } from '@/components/skeletons/skeletons';

const AUTHOR_TYPE = {
    SYSTEM: 'system',
    HOST: 'HOST',
    CLIENT: 'CLIENT',
};

export default function Page({ params }) {
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
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Failed to retrieve token. Please reload the page and try again.',
                });
            }
        }
        fetchToken();
    }, []);

    useEffect(() => {
        if (params.tripid) {
            setTripId(Number(params.tripid));
        }
    }, [params.tripid]);

    const { data: response } = useTripDetails(params.tripid);
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
        refetchOnWindowFocus: true,
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
        onError: error => {
            console.error('Error sending message:', error);
            toast({
                duration: 3000,
                variant: 'destructive',
                description: 'Failed to send message. Please try again.',
            });
        },
    });

    const handleSendMessage = event => {
        event.preventDefault();
        sendMessageMutation.mutate();
    };

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [sendMessageMutation.isPending]);

    return (
        <div className='rounded-lg px-4 pt-2 text-card-foreground shadow-sm'>
            <div className='h-[calc(90vh-250px)] space-y-4 overflow-y-auto md:h-[calc(90vh-200px)]' ref={chatWindowRef}>
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
                        onChange={e => setInputMessage(e.target.value)}
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
        [AUTHOR_TYPE.SYSTEM]: '/robot.png',
        [AUTHOR_TYPE.HOST]: '/dummy_avatar.png',
    };

    const isClientMessage = message.author === AUTHOR_TYPE.CLIENT;

    const images = tripData?.vehicleImages;

    if (isClientMessage) {
        return (
            <div className='ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg bg-black px-3 py-2 text-sm text-primary-foreground'>
                {message?.message}
                <p className='flex items-center justify-end text-[10px] text-white'> {format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
            </div>
        );
    } else {
        return (
            <div className='flex'>
                {message.author !== AUTHOR_TYPE.CLIENT && (
                    <img src={authorImage[message.author]} alt={message.author} width={32} height={32} className='mr-2 size-8 rounded-full border' />
                )}
                {message.message.toLocaleLowerCase() === 'a new reservation was requested' ? (
                    <div className='flex flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>
                        <span>{message.message}</span>

                        {images.length > 0 ? (
                            <div className='relative max-w-md sm:overflow-hidden  md:max-w-lg md:rounded-lg'>
                                <EmblaCarousel slides={images} />
                            </div>
                        ) : (
                            <div className=' embla__slide max-h-80 overflow-hidden md:rounded-md'>
                                <img src='../image_not_available.png' alt='image_not_found' className='h-full w-full min-w-full object-cover md:rounded-md' />
                            </div>
                        )}

                        <p className='text-16 font-semibold capitalize'>
                            {tripData?.vehmake} {tripData?.vehmodel} {tripData?.vehyear}
                        </p>

                        <div>
                            Trip Start Date :<span className='font-medium text-gray-800'> {formatDateAndTime(tripData?.starttime, tripData?.vehzipcode)}</span>
                        </div>

                        <div>
                            Trip End Date : <span className='font-medium text-gray-800'> {formatDateAndTime(tripData?.endtime, tripData?.vehzipcode)}</span>
                        </div>

                        <div>
                            Pickup & Return :{' '}
                            <span className='font-medium capitalize text-gray-800'>
                                {tripData?.vehaddress1 ? `${tripData?.vehaddress1}, ` : null}
                                {tripData?.vehaddress2 ? `${tripData?.vehaddress2}, ` : null}
                                {tripData?.vehcity ? `${tripData?.vehcity}, ` : null}
                                {tripData?.vehstate ? `${tripData?.vehstate}, ` : null}
                                {tripData?.vehzipcode ? `${tripData?.vehzipcode}` : null}
                            </span>
                        </div>

                        <p className='flex items-center justify-end text-[10px] text-black'>{format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium'>
                        {message.message}
                        <p className='flex items-center justify-end text-[10px] text-black'>{format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
                    </div>
                )}
            </div>
        );
    }
}
