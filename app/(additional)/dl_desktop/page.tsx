'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { VerificationStatus } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

export default function VerificationComponent() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<VerificationStatus>('initializing');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to Socket.IO server
        const socketio = io('https://bundee-auxiliary-services-qa.azurewebsites.net/');

        socketio.on('connect', () => {
            setStatus('connected');
        });

        socketio.on('message', (data) => {
            const message = JSON.parse(data) as { type: string; sessionId?: string };

            switch (message.type) {
                case 'SESSION_ID':
                    if (message.sessionId) {
                        setSessionId(message.sessionId);
                        setStatus('waiting');
                    }
                    break;
                case 'MOBILE_CONNECTED':
                    setStatus('mobile_connected');
                    break;
                case 'VERIFICATION_COMPLETE':
                    setStatus('verified');
                    break;
            }
        });

        socketio.on('disconnect', () => {
            setStatus('disconnected');
        });

        setSocket(socketio);

        return () => {
            socketio.disconnect();
        };
    }, []);

    // Generate mobile verification URL with session ID
    const getMobileUrl = (): string => {
        return `${window.location.origin}/mobile-verify/${sessionId}`;
    };

    return (
        <Card className='mx-auto mt-8 w-full max-w-md'>
            <CardContent className='p-6'>
                <div className='text-center'>
                    <h2 className='mb-4 font-bold text-2xl'>Mobile Verification</h2>

                    {status === 'waiting' && (
                        <div className='space-y-4'>
                            <p className='text-gray-600'>Scan QR code with your mobile device to continue verification</p>
                            <div className='flex justify-center'>
                                <QRCodeSVG value={getMobileUrl()} size={256} />
                            </div>

                            {getMobileUrl()}
                        </div>
                    )}

                    {status === 'mobile_connected' && <p className='text-blue-600'>Mobile device connected! Please complete verification on your phone.</p>}

                    {status === 'verified' && (
                        <div className='space-y-4'>
                            <p className='font-semibold text-green-600'>Verification completed successfully!</p>
                            <Button onClick={() => window.location.reload()}>Start New Verification</Button>
                        </div>
                    )}

                    {status === 'disconnected' && <p className='text-red-600'>Connection lost. Please refresh the page to try again.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
