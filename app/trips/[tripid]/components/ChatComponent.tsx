import { format } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import Carousel from '@/components/ui/carousel/carousel';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { getTripChatHistory, sendMessageToHost } from '@/server/tripOperations';
import { formatDateAndTime } from '@/lib/utils';

const AUTHOR_TYPE = {
    SYSTEM: 'system',
    HOST: 'HOST',
    CLIENT: 'CLIENT',
};

export default function ChatComponent({ tripsData }) {
    const [token, setToken] = useState('');
    const [tripId, setTripId] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    const [messageList, setMessageList] = useState([]);

    const chatWindowRef = useRef(null);

    async function handleSendMessage() {
        try {
            const data = await sendMessageToHost(tripId, inputMessage, token);
            if (data != null) {
                const context = await getTripChatHistory(tripId, token);
                setMessageList(context.reverse());
                setInputMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                duration: 3000,
                variant: 'destructive',
                description: 'Failed to send message. Please try again.',
            });
        }
    }

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 5;
        let intervalId: string | number | NodeJS.Timeout;

        async function fetchChatHistory(tripId, token) {
            try {
                const data = await getTripChatHistory(tripId, token);
                if (data != null) {
                    setMessageList(data.reverse());
                    retryCount = 0; // Reset retry count on successful fetch
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
                retryCount++;
                if (retryCount >= maxRetries) {
                    console.error('Maximum retry limit reached. Stopping further retries.');
                    clearInterval(intervalId);
                }
            }
        }

        async function getIdTokenFromFirebase() {
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

        async function initializeChat() {
            const pathSegments = window.location.pathname.split('/');
            const foundTripId = pathSegments[pathSegments.length - 1];

            if (foundTripId) {
                setTripId(foundTripId);
                const token = await getIdTokenFromFirebase();
                if (token) {
                    await fetchChatHistory(foundTripId, token);
                }
            }
        }

        async function startChatPolling() {
            initializeChat(); // Initial call to fetch chat history
            intervalId = setInterval(() => {
                initializeChat();
            }, 5000);
        }

        startChatPolling();

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className='mx-auto mb-4 mt-4 flex min-h-[80vh] max-w-2xl rounded-lg border bg-white px-4 pb-16 pt-10 sm:px-6 lg:max-w-7xl'>
            <div className='flex w-full flex-col space-y-4'>
                <div className='flex-1 gap-5 overflow-y-auto' ref={chatWindowRef}>
                    {messageList.map((message, index) => (
                        <Message key={index} message={message} tripsData={tripsData} />
                    ))}
                </div>

                <div className='flex items-center space-x-2'>
                    <input
                        type='text'
                        placeholder='Type your message...'
                        className='flex-1 rounded-full border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring'
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                    />
                    <button
                        onClick={handleSendMessage}
                        className='rounded-full bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-blue-600'>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

function Message({ message, tripsData }) {
    const authorImage = {
        [AUTHOR_TYPE.SYSTEM]: '/robot.png',
        [AUTHOR_TYPE.HOST]: '/dummy_avatar.png',
    };

    const isClientMessage = message.author === AUTHOR_TYPE.CLIENT;

    return (
        <div className={`${isClientMessage ? 'flex justify-end' : 'flex justify-start'} my-6`}>
            <div className='flex items-start'>
                {message.author !== AUTHOR_TYPE.CLIENT && (
                    <Image src={authorImage[message.author]} alt={message.author} width={32} height={32} className='mr-2 h-8 w-8 rounded-full' />
                )}

                <div className={`p-2 px-4 ${isClientMessage ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg rounded-tl-none`}>
                    <p className='text-sm font-semibold'>{message.message}</p>

                    {message.message.toLocaleLowerCase() === 'a new reservation was requested' && (
                        <div className='space-y-2 p-4'>
                            {tripsData?.vehicleImages.length > 0 && (
                                <div className='max-w-md rounded-lg sm:overflow-hidden'>
                                    <Carousel autoSlide={true}>
                                        {tripsData.vehicleImages.map((s, i) => (
                                            <img key={i} src={s.imagename} className='max-h-fit min-w-full' alt={`vehicle image ${i}`} />
                                        ))}
                                    </Carousel>
                                </div>
                            )}
                            <p className='font-semibold'>
                                {tripsData?.vehmake} {tripsData?.vehmodel} {tripsData?.vehyear}
                            </p>

                            <div>
                                Trip Start Date :{' '}
                                <span className='text-base font-medium text-gray-800'>
                                    {formatDateAndTime(tripsData?.starttime, tripsData?.vehzipcode)}
                                    {/* {format(new Date(tripsData?.starttime), 'LLL dd, y')} | {format(new Date(tripsData?.starttime), 'h:mm a')} */}
                                </span>{' '}
                            </div>
                            <div>
                                Trip End Date :{' '}
                                <span className='text-base font-medium text-gray-800'>
                                    {formatDateAndTime(tripsData?.endtime, tripsData?.vehzipcode)}
                                    {/* {format(new Date(tripsData?.endtime), 'LLL dd, y')} | {format(new Date(tripsData?.endtime), 'h:mm a')} */}
                                </span>{' '}
                            </div>

                            <div>
                                Pickup & Return :
                                <span className='ml-2 text-base font-medium text-gray-800'>
                                    {tripsData?.vehaddress1 ? `${tripsData?.vehaddress1}, ` : null}
                                    {tripsData?.vehaddress2 ? `${tripsData?.vehaddress2}, ` : null}
                                    {tripsData?.vehcity ? `${tripsData?.vehcity}, ` : null}
                                    {tripsData?.vehstate ? `${tripsData?.vehstate}, ` : null}
                                    {tripsData?.vehzipcode ? `${tripsData?.vehzipcode}` : null}
                                </span>
                            </div>
                        </div>
                    )}

                    <p className='flex items-center justify-end text-xs text-black'>{format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
                </div>
            </div>
        </div>
    );
}
