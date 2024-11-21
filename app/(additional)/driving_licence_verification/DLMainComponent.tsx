'use client';

import QRCodeSkeleton from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import { CircleCheckIcon, LogoIcon } from '@/public/icons';
import type { SocketMessage, UseSocketReturn } from '@/types';
import { CircleX } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { type Socket, io } from 'socket.io-client';
import IDScan from './IDScan';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), { ssr: false });

function useSocket(token: string | null): UseSocketReturn {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState('initializing');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [mobileUrl, setMobileUrl] = useState('');

    useEffect(() => {
        const socketio = io(process.env.NEXT_PUBLIC_AUXILIARY_SERVICE_BASEURL, {
            reconnectionAttempts: 3,
            timeout: 10000,
            transports: ['websocket', 'polling']
        });

        socketio.on('connect', () => {
            console.log('Connected to websocket');
            setStatus('connected');
            socketio.emit('message', JSON.stringify({ type: 'DESKTOP_CONNECT' }));
        });

        socketio.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError('Failed to connect to server. Please check your internet connection and try again.');
            setStatus('error');
        });

        socketio.on('message', (data: string) => {
            try {
                const message: SocketMessage = JSON.parse(data);
                console.log('Received message:', message);

                switch (message.type) {
                    case 'SESSION_ID':
                        if (message.sessionId) {
                            setSessionId(message.sessionId);
                            setStatus('waiting');

                            if (token) {
                                setMobileUrl(`${window.location.origin}/mobile-verify/${message.sessionId}?token=${token}`);
                            } else {
                                setMobileUrl(`${window.location.origin}/mobile-verify/${message.sessionId}`);
                            }
                        }
                        break;
                    case 'MOBILE_CONNECTED':
                        setStatus('mobile_connected');
                        break;
                    case 'VERIFY_STATUS':
                        setStatus(message.verified ? 'verified' : 'failed');
                        break;
                    case 'SESSION_DESTROYED':
                        setStatus('session_destroyed');
                        setSessionId(null);
                        setMobileUrl('');
                        break;
                }
            } catch (err) {
                console.error('Error parsing message:', err);
                setError('Invalid message format received');
            }
        });

        setSocket(socketio);

        return () => {
            socketio.disconnect();
        };
    }, []);

    const retryConnection = () => {
        if (socket) {
            setStatus('initializing');
            setError('');
            socket.emit('message', JSON.stringify({ type: 'DESKTOP_CONNECT' }));
        } else {
            window.location.reload();
        }
    };

    return { status, error, sessionId, mobileUrl, retryConnection };
}

export default function DLMainComponent() {
    const params = useSearchParams();
    const token = params.get('token');
    const callbackUrl = params.get('callbackUrl');

    const { status, error, sessionId, mobileUrl, retryConnection } = useSocket(token);

    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });

    if (isTabletOrLarger) {
        return (
            <>
                <div className='fixed top-10 left-[10%]'>
                    <LogoIcon />
                </div>
                <div className='flex h-[100dvh] flex-col items-center justify-center gap-5 overflow-x-hidden p-5 lg:gap-8'>
                    {error && (
                        <ContentWithTitle>
                            <p className='my-10 max-w-[600px] text-balance'>{error}</p>

                            <div className='w-full lg:max-w-[512px]'>
                                <Button
                                    className='w-full'
                                    variant='black'
                                    size='lg'
                                    onClick={() => {
                                        window.location.reload();
                                    }}>
                                    Retry
                                </Button>
                            </div>
                        </ContentWithTitle>
                    )}

                    {status === 'initializing' && (
                        <ContentWithTitle>
                            <p className='text-lg text-muted-foreground'>Scan QR code with your mobile device to continue verification.</p>
                            <div className='mt-6 flex justify-center lg:mt-7'>
                                <QRCodeSkeleton />
                            </div>

                            <h3 className='my-10 flex w-full items-center lg:max-w-[512px]'>
                                <span className='h-1 flex-grow rounded bg-neutral-200' />
                                <span className='mx-3 font-medium text-lg'>OR</span>
                                <span className='h-1 flex-grow rounded bg-neutral-200' />
                            </h3>

                            <div className='w-full lg:max-w-[512px]'>
                                <Button variant='outline' size='lg' className='w-full rounded-full'>
                                    Send SMS
                                </Button>
                            </div>
                        </ContentWithTitle>
                    )}

                    {status === 'waiting' && (
                        <ContentWithTitle>
                            <p className='text-lg text-muted-foreground'>Scan QR code with your mobile device to continue verification.</p>
                            <div className='mt-6 flex justify-center lg:mt-7'>{mobileUrl && <QRCodeSVG value={mobileUrl} size={200} />}</div>

                            <h3 className='my-7 flex w-full items-center lg:max-w-[512px]'>
                                <span className='h-1 flex-grow rounded bg-neutral-200' />
                                <span className='mx-3 font-medium text-lg'>OR</span>
                                <span className='h-1 flex-grow rounded bg-neutral-200' />
                            </h3>

                            <div className='w-full lg:max-w-[512px]'>
                                Click the button below to receive a verification link via SMS.
                                <Button variant='outline' size='lg' className='mt-4 w-full rounded-full'>
                                    Send SMS
                                </Button>
                            </div>
                        </ContentWithTitle>
                    )}

                    {status === 'mobile_connected' && (
                        <div className='flex flex-col items-center gap-3 text-center '>
                            <img src='./images/car_loading.gif' alt='loading' className='w-52' />
                            <h3 className='font-bold text-3xl'>Connection Successful!</h3>
                            <p className=' max-w-[600px] text-lg'>
                                Your device is now connected. Please proceed to verify your driver's license on your phone.
                            </p>
                        </div>
                    )}

                    {status === 'verified' && (
                        <div className=' flex flex-col items-center gap-3 text-center '>
                            <CircleCheckIcon className='mb-6 size-24 text-[#85A80F]' />
                            <h3 className='font-bold text-3xl'>Verification Successful!</h3>
                            <p className='text-lg '>We have successfully verified your documents. Thank you!</p>
                            {callbackUrl && (
                                <Link href={callbackUrl} className='mt-8 rounded-md bg-black p-2 px-16 text-white hover:bg-black/80'>
                                    Go Back
                                </Link>
                            )}
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className=' flex flex-col items-center text-center'>
                            <CircleX className='size-20 text-red-500' />
                            <h3 className='mt-10 font-bold text-3xl'>Verification failed!</h3>
                            <p className='text-lg '>The provided documents did not meet the required confidence thresholds.</p>
                            <p className='mb-10 text-lg'> Please try again with clearer images.</p>

                            <div className='w-full lg:max-w-[512px]'>
                                <Button
                                    className='w-full'
                                    variant='black'
                                    size='lg'
                                    onClick={() => {
                                        window.location.reload();
                                    }}>
                                    Retry
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'session_destroyed' && (
                        <ContentWithTitle>
                            <p className='text-destructive'>Session was closed without verification.</p>
                            <Button onClick={retryConnection}>Start New Verification</Button>
                        </ContentWithTitle>
                    )}

                    {mobileUrl && <p className='break-all text-muted-foreground text-sm'>{mobileUrl}</p>}
                </div>
            </>
        );
    }

    return <IDScan />;
}

function ContentWithTitle({ children }) {
    return (
        <div>
            <h3 className='font-bold text-3xl'>Verify Driver’s License</h3>
            {children}
        </div>
    );
}
