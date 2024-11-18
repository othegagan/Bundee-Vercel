'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import QRCodeSVG with ssr: false
const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
    ssr: false
});

export default function VerificationComponent() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('initializing');
    const [mobileUrl, setMobileUrl] = useState<string>('');

    const { status: socketStatus, emitEvent, subscribe, unsubscribe } = useSocket('https://auxiliary-service.onrender.com/');

    useEffect(() => {
        subscribe((message) => {
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
                case 'VERIFICATION_COMPLETE':
                    setStatus('verified');
                    break;
                case 'VERIFY_STATUS':
                    setStatus(message.verified ? 'verified' : 'failed');
                    break;
            }
        });

        return () => {
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    return (
        <Card className='mx-auto mt-8 w-full max-w-md'>
            <CardContent className='p-6'>
                <div className='text-center'>
                    <h2 className='mb-4 font-bold text-2xl'>Mobile Verification</h2>

                    {status === 'initializing' && <p className='text-gray-600'>Initializing...</p>}

                    {status === 'waiting' && (
                        <div className='space-y-4'>
                            <p className='text-gray-600'>Scan QR code with your mobile device to continue verification</p>
                            <div className='flex justify-center'>{mobileUrl && <QRCodeSVG value={mobileUrl} size={256} />}</div>
                        </div>
                    )}

                    {status === 'mobile_connected' && <p className='text-blue-600'>Mobile device connected! Please complete verification on your phone.</p>}

                    {status === 'verified' && (
                        <div className='space-y-4'>
                            <p className='font-semibold text-green-600'>Verification completed successfully!</p>
                            <Button onClick={() => window.location.reload()}>Start New Verification</Button>
                        </div>
                    )}

                    {status === 'failed' && <p className='text-red-600'>Verification failed. Please try again.</p>}

                    {socketStatus === 'disconnected' && <p className='text-red-600'>Connection lost. Please refresh the page to try again.</p>}

                    {mobileUrl && <p className='mt-4 text-gray-500 text-sm'>{mobileUrl}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
