'use client';

import { ChatSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { useTripDetails } from '@/hooks/useTripDetails';
import { auth } from '@/lib/firebase';
import { formatDateAndTime, getFullAddress, sortImagesByIsPrimary } from '@/lib/utils';
import { getTripChatHistory } from '@/server/tripOperations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Paperclip, Send, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const AUTHOR_TYPE = {
    SYSTEM: 'system',
    HOST: 'HOST',
    CLIENT: 'CLIENT'
};

const useAuthToken = () => {
    const [token, setToken] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    setToken(idToken);
                } catch (error) {
                    console.error('Error retrieving token:', error);
                    toast.error('Failed to retrieve token. Please reload the page and try again.');
                }
            } else {
                setToken('');
            }
        });

        return () => unsubscribe();
    }, []);

    return token;
};

export default function MessagePage({ params }) {
    const token = useAuthToken();
    console.log(token);
    const [inputMessage, setInputMessage] = useState('');
    const tripId = Number(params.tripId);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [file, setFile] = useState(null);

    const chatWindowRef = useRef(null);
    const queryClient = useQueryClient();

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
            if ((tripId && token) || inputMessage || file) {
                const formData = new FormData();

                if (file) formData.append('file', file || null);
                formData.append('tripId', String(tripId));
                formData.append('message', inputMessage || '');
                formData.append('author', 'CLIENT');

                const config = {
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                };

                try {
                    const response = await axios.post('https://bundee-chatservice-dev.azurewebsites.net/sendMediaMessage', formData, config);
                    return {
                        success: true
                    };
                } catch (error) {
                    console.error('Error sending message:', error);
                    throw new Error('Failed to send message.');
                }
            } else {
                throw new Error('Missing tripId, token, or inputMessage');
            }
        },
        onSuccess: async () => {
            setInputMessage('');
            setFile(null);
            await queryClient.invalidateQueries({ queryKey: ['chatHistory', tripId, token] });
            removeFile();
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    function removeFile() {
        setPreviewImage(null);
        setFile(null);
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to auto to shrink the textarea when text is removed
            textareaRef.current.style.height = 'auto';
            // Adjust the height based on the scroll height (content size)
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputMessage]);

    return (
        <div className=' flex h-[calc(98dvh-120px)] w-full flex-col justify-between rounded-lg pt-2 text-card-foreground md:px-4 md:shadow-sm lg:border lg:pb-4'>
            <div className='flex h-full w-full flex-col gap-6 overflow-y-auto p-2' ref={chatWindowRef}>
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

            <form onSubmit={handleSendMessage} className='relative flex w-full flex-col gap-2 px-2 pt-3 '>
                {previewImage && (
                    <div className='-top-[60px] -left-2 absolute z-10 inline-flex overflow-hidden rounded '>
                        <div className='h-20 w-32 overflow-hidden'>
                            <img className='h-full w-full object-cover p-0' src={previewImage} style={{ color: 'transparent' }} alt='' />
                        </div>
                        <button type='button' className='absolute top-1 right-1 bg-white' onClick={removeFile}>
                            <span className='sr-only'>remove item 1</span>
                            <Trash className='h-4 w-4 text-destructive duration-200 ease-in-out' />
                        </button>
                    </div>
                )}

                <div className='relative flex w-full items-center justify-between gap-2 px-2 pt-3 '>
                    <div className='flex'>
                        <label htmlFor='image-upload' className='cursor-pointer'>
                            <Paperclip className='h-5 w-5 text-gray-500' />
                        </label>
                        <input id='image-upload' type='file' accept='image/*' onChange={handleImageUpload} className='hidden' />
                    </div>
                    <div className='relative w-full' style={{ opacity: 1, transform: 'none' }}>
                        <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder='Type your message...'
                            className='flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                            rows={1}
                            style={{ overflow: 'hidden' }} // Prevent scrollbars from appearing
                        />
                    </div>
                    <Button
                        variant='black'
                        type='submit'
                        className='px-3'
                        disabled={(!inputMessage.trim() && !file) || sendMessageMutation.isPending}
                        loading={sendMessageMutation.isPending}>
                        <Send className='size-4' />
                        <span className='sr-only'>Send</span>
                    </Button>
                </div>
            </form>
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
                {message.mediaUrl && <img src={message.mediaUrl} alt='media content' className='mt-2 h-auto max-w-full rounded-lg' />}

                {message?.message}

                <p className='flex items-center justify-end text-[10px]'>{format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
            </div>
        );
    }

    if (isHostMessage) {
        return (
            <div className='flex w-max max-w-[75%]'>
                {message.author !== AUTHOR_TYPE.CLIENT && (
                    <img src={authorImage[message.author]} alt={message.author} width={32} height={32} className='mr-2 size-8 rounded-full border' />
                )}

                <div className='flex flex-col gap-2 rounded-lg rounded-tl-none bg-[#E1EFFE] px-3 py-2 font-medium text-sm'>
                    {message.message}

                    {message.mediaUrl && <img src={message.mediaUrl} alt='media content' className='mt-2 h-auto rounded-lg' />}

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
