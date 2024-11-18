'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), { ssr: false });

interface SocketMessage {
    type: string;
    sessionId?: string;
    verified?: boolean;
    [key: string]: any;
}

export default function DesktopVerificationComponent() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState('initializing');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [mobileUrl, setMobileUrl] = useState('');

    useEffect(() => {
        const socketio = io('https://auxiliary-service.onrender.com', {
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
                            setMobileUrl(`${window.location.origin}/mobile-verify/${message.sessionId}`);
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

    const handleRetry = () => {
        if (socket) {
            setStatus('initializing');
            setError('');
            socket.emit('message', JSON.stringify({ type: 'DESKTOP_CONNECT' }));
        } else {
            window.location.reload();
        }
    };

    return (
        <Card className='mx-auto mt-8 w-full max-w-md'>
            <CardContent className='p-6'>
                <div className='space-y-4 text-center'>
                    <h2 className='font-bold text-2xl'>Driving Licence Verification</h2>

                    {error && (
                        <Alert variant='destructive'>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {status === 'initializing' && (
                        <div className='flex items-center justify-center space-x-2'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            <p className='text-muted-foreground'>Connecting to server...</p>
                        </div>
                    )}

                    {status === 'waiting' && (
                        <div className='space-y-4'>
                            <p className='text-muted-foreground'>Scan QR code with your mobile device to continue verification</p>
                            <div className='flex justify-center'>{mobileUrl && <QRCodeSVG value={mobileUrl} size={256} />}</div>
                        </div>
                    )}

                    {status === 'mobile_connected' && <p className='text-primary'>Mobile device connected! Please complete verification on your phone.</p>}

                    {status === 'verified' && (
                        <div className='space-y-4'>
                            <p className='font-semibold text-green-600'>Verification completed successfully!</p>
                            <Button onClick={handleRetry}>Start New Verification</Button>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className='space-y-4'>
                            <p className='text-destructive'>Verification failed.</p>
                            <Button onClick={handleRetry}>Try Again</Button>
                        </div>
                    )}

                    {status === 'session_destroyed' && (
                        <div className='space-y-4'>
                            <p className='text-destructive'>Session was closed without verification.</p>
                            <Button onClick={handleRetry}>Start New Verification</Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className='space-y-4'>
                            <Button onClick={handleRetry}>Retry Connection</Button>
                        </div>
                    )}

                    {mobileUrl && <p className='break-all text-muted-foreground text-sm'>{mobileUrl}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
