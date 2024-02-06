import { getTripChatHistory } from '@/app/_actions/get_message_history';
import { sendMessageToHost } from '@/app/_actions/send_messages';
import { auth } from '@/app/auth/firebase';
import { format } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import Carousel from '@/components/ui/carousel/carousel';
import { convertToAPITimeFormat, extractTimeIn12HourFormat } from '@/lib/createDateTime';
import Image from 'next/image';

export default function ConversationDetails({ tripsData }: any) {

    const [token, setToken] = useState('');
    const [tripId, setTripId] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    const [messageList, setMessageList] = useState([]);

    const chatWindowRef = useRef(null);

    async function handleSendMessage() {
        const data = await sendMessageToHost(tripId, inputMessage, token);
        if (data.success) {
            // console.log('message sent successfylly');
        }
        setInputMessage('');
        const context = await getTripChatHistory(tripId, token);
        if (data != null) {
            setMessageList(context.reverse());
        }
    }

    useEffect(() => {



        const fetchChatHistory = async (tripId, token) => {
            try {
                const data = await getTripChatHistory(tripId, token);
                if (data != null) {
                    setMessageList(data.reverse());
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
            }
        };

        const getIdTokenFromFirebase = async () => {
            if (auth.currentUser) {
                try {
                    const idToken = await auth.currentUser.getIdToken();
                    setToken(idToken);
                    return idToken;
                } catch (error) {
                    console.error('Error retrieving token:', error);
                    // alert('Something went wrong, Reload the page and try again');
                }
            } else {
                // alert('You are not logged in');
            }
        };

        const initializeChat = async () => {
            const pathSegments = window.location.pathname.split('/');
            const foundTripId = pathSegments[pathSegments.length - 1];

            if (foundTripId) {
                setTripId(foundTripId);
                const token = await getIdTokenFromFirebase();
                if (token) {
                    await fetchChatHistory(foundTripId, token);
                }
            }
        };

        initializeChat();

        setInterval(() => {
            initializeChat();
        }, 5000);
    }, []);


    return (
        <div className='mb-4 mt-4  flex bg-white rounded-lg border  mx-auto max-w-2xl px-4 pb-16 pt-10 min-h-[80vh] sm:px-6 lg:max-w-7xl'>
            <div className='w-full flex flex-col space-y-4'>
                <div className='flex-1 gap-5 overflow-y-auto' ref={chatWindowRef}>
                    {messageList.map((message, index) => (
                        <div
                            key={index} // It's better to have a unique key, consider using a message ID if available
                            className={`${['system', 'HOST'].includes(message.author) ? 'flex justify-start items-center' : 'flex justify-end items-center'} my-6`}>
                            <div className='flex items-start'>
                                {['system'].includes(message.author) && <Image src='/robot.png' alt='S' width={32} height={32} className='w-8 h-8 rounded-full mr-2' />}

                                {['HOST'].includes(message.author) && (
                                    <img src='https://emedia1.nhs.wales/HEIW2/cache/file/F4C33EF0-69EE-4445-94018B01ADCF6FD4.png' alt='H' className='w-8 h-8 rounded-full mr-2' />
                                )}

                                <div
                                    className={`${
                                        ['CLIENT'].includes(message.author) ? 'bg-blue-100 text-black self-end mt-4' : 'bg-gray-100 text-black '
                                    } p-2 px-4 rounded-lg rounded-tl-none`}>
                                    <p className='text-sm font-semibold'>{message.message}</p>

                                    {message.message.toLocaleLowerCase() == 'a new reservation was requested' && (
                                        <div className='p-4 space-y-2'>
                                            {tripsData[0]?.vehicleImages.length > 0 && (
                                                <div className='sm:overflow-hidden max-w-md rounded-lg '>
                                                    <Carousel autoSlide={true}>
                                                        {tripsData[0].vehicleImages.map((s, i) => (
                                                            <img key={i} src={s.imagename} className='max-h-fit min-w-full' alt={`vehicle image ${i}`} />
                                                        ))}
                                                    </Carousel>
                                                </div>
                                            )}
                                            <p className='font-semibold'>
                                                {tripsData[0]?.vehmake} {tripsData[0]?.vehmodel} {tripsData[0]?.vehyear}
                                            </p>

                                            <div>
                                                Trip Start Date :{' '}
                                                <span className='text-base font-medium text-gray-800'>
                                                    {format(new Date(tripsData[0]?.starttime), 'LLL dd, y')} | {format(new Date(tripsData[0]?.starttime), 'h:mm a')}
                                                </span>{' '}
                                            </div>
                                            <div>
                                                Trip End Date :{' '}
                                                <span className='text-base font-medium text-gray-800'>
                                                    {format(new Date(tripsData[0]?.endtime), 'LLL dd, y')} | {format(new Date(tripsData[0]?.endtime), 'h:mm a')}
                                                </span>{' '}
                                            </div>

                                            <div>
                                                Pickup & Return :
                                                <span className='text-base font-medium text-gray-800 ml-2'>
                                                    {tripsData[0]?.vehaddress1 ? `${tripsData[0]?.vehaddress1}, ` : null}
                                                    {tripsData[0]?.vehaddress2 ? `${tripsData[0]?.vehaddress2}, ` : null}
                                                    {tripsData[0]?.vehcity ? `${tripsData[0]?.vehcity}, ` : null}
                                                    {tripsData[0]?.vehstate ? `${tripsData[0]?.vehstate}, ` : null}
                                                    {tripsData[0]?.vehzipcode ? `${tripsData[0]?.vehzipcode}` : null}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <p
                                        className={`${
                                            ['system'].includes(message.author)
                                                ? 'flex justify-start items-center text-xs text-black '
                                                : 'flex justify-end items-center text-xs text-black '
                                        }`}>
                                        {format(new Date(message.deliveryDate), 'PP | hh:mm a')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex items-center space-x-2'>
                    <input
                        type='text'
                        placeholder='Type your message...'
                        className='flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring focus:border-blue-500'
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                    />
                    <button onClick={handleSendMessage} className='bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out'>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
