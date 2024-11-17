'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { VerificationStatus } from '@/types';
import { useEffect, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

interface PageProps {
    params: {
        sessionId: string;
    };
}

export default function MobileVerifyPage({ params }: PageProps) {
    const { sessionId } = params;
    const [status, setStatus] = useState<VerificationStatus>('connecting');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketio = io('https://auxiliary-service.onrender.com/');

        socketio.on('connect', () => {
            // Notify server this is mobile connection
            socketio.emit(
                'message',
                JSON.stringify({
                    type: 'MOBILE_CONNECT',
                    sessionId
                })
            );
            setStatus('connected');
        });

        socketio.on('disconnect', () => {
            setStatus('disconnected');
        });

        setSocket(socketio);

        return () => {
            socketio.disconnect();
        };
    }, [sessionId]);

    const handleVerify = () => {
        if (socket) {
            // In a real app, you would perform actual verification here
            socket.emit(
                'message',
                JSON.stringify({
                    type: 'VERIFY_COMPLETE',
                    sessionId
                })
            );
            setStatus('verified');
        }
    };

    return (
        <Card className='mx-auto mt-8 w-full max-w-md'>
            <CardContent className='p-6'>
                <div className='space-y-4 text-center'>
                    <h2 className='font-bold text-2xl'>Mobile Verification</h2>
                    {status === 'connecting' && <p className='text-gray-600'>Connecting...</p>}
                    {status === 'connected' && (
                        <div className='space-y-4'>
                            <p className='text-gray-600'>Ready to verify</p>
                            <Button onClick={handleVerify} className='w-full'>
                                Complete Verification
                            </Button>
                        </div>
                    )}
                    {status === 'verified' && <p className='text-green-600'>Verification complete! You can close this page.</p>}
                    {status === 'disconnected' && <p className='text-red-600'>Connection lost. Please try scanning the QR code again.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
