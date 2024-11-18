'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

interface PageProps {
    params: {
        sessionId: string;
    };
}

interface SocketMessage {
    type: string;
    sessionId?: string;
    verified?: boolean;
    [key: string]: any;
}

export default function MobileVerifyPage({ params }: PageProps) {
    const { sessionId } = params;
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<string>('connecting');
    const [error, setError] = useState<string>('');
    const [interactionOccurred, setInteractionOccurred] = useState(false);

    useEffect(() => {
        const socketio = io('https://auxiliary-service.onrender.com', {
            reconnectionAttempts: 3,
            timeout: 10000,
            transports: ['websocket', 'polling']
        });

        socketio.on('connect', () => {
            console.log('Connected to websocket');
            setStatus('connected');
            socketio.emit(
                'message',
                JSON.stringify({
                    type: 'MOBILE_CONNECT',
                    sessionId
                })
            );
        });

        socketio.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError('Failed to connect to server. Please try scanning the QR code again.');
            setStatus('error');
        });

        socketio.on('message', (data: string) => {
            try {
                const message: SocketMessage = JSON.parse(data);
                console.log('Received message:', message);

                if (message.type === 'VERIFY_COMPLETE') {
                    setStatus('verified');
                }
            } catch (err) {
                console.error('Error parsing message:', err);
                setError('Invalid message format received');
            }
        });

        setSocket(socketio);

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!interactionOccurred) {
                socketio.emit(
                    'message',
                    JSON.stringify({
                        type: 'DESTROY_SESSION',
                        sessionId
                    })
                );
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            socketio.disconnect();
        };
    }, [sessionId, interactionOccurred]);

    const handleVerify = (isVerified: boolean) => {
        setInteractionOccurred(true);
        if (socket) {
            socket.emit(
                'message',
                JSON.stringify({
                    type: 'VERIFY_STATUS',
                    sessionId,
                    verified: isVerified
                })
            );
            setStatus(isVerified ? 'verified' : 'failed');
        } else {
            setError('No active connection to server');
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

                    {status === 'connecting' && (
                        <div className='flex items-center justify-center space-x-2'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            <p className='text-muted-foreground'>Connecting to server...</p>
                        </div>
                    )}

                    {status === 'connected' && (
                        <div className='space-y-4'>
                            <Button onClick={() => handleVerify(true)} variant='success' className='w-full'>
                                Success
                            </Button>
                            <Button onClick={() => handleVerify(false)} variant='destructive' className='w-full'>
                                Fail
                            </Button>
                        </div>
                    )}

                    {status === 'verified' && <p className='font-semibold text-green-600'>Verification complete! You can close this page.</p>}

                    {status === 'failed' && (
                        <div className='space-y-4'>
                            <p className='text-destructive'>Verification failed.</p>
                            <Button onClick={() => setStatus('connected')}>Try Again</Button>
                        </div>
                    )}

                    {status === 'error' && <Button onClick={() => window.location.reload()}>Retry Connection</Button>}
                </div>
            </CardContent>
        </Card>
    );
}
