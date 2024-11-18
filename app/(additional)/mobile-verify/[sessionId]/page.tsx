'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

interface PageProps {
    params: {
        sessionId: string;
    };
}

export default function MobileVerifyPage({ params }: PageProps) {
    const { sessionId } = params;
    const [status, setStatus] = useState<string>('connecting');

    const { status: socketStatus, emitEvent, subscribe, unsubscribe } = useSocket('https://auxiliary-service.onrender.com/', sessionId);

    useEffect(() => {
        subscribe((message) => {
            if (message.type === 'VERIFY_COMPLETE') {
                setStatus('verified');
            }
        });

        return () => {
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    const handleVerify = (isVerified: boolean) => {
        emitEvent('message', {
            type: 'VERIFY_STATUS',
            sessionId,
            verified: isVerified
        });
        setStatus(isVerified ? 'verified' : 'failed');
    };

    return (
        <Card className='mx-auto mt-8 w-full max-w-md'>
            <CardContent className='p-6'>
                <div className='space-y-4 text-center'>
                    <h2 className='font-bold text-2xl'>Mobile Verification</h2>
                    {status === 'connecting' && <p className='text-gray-600'>Connecting...</p>}
                    {socketStatus === 'connected' && (
                        <div className='space-y-4'>
                            <p className='text-gray-600'>Ready to verify</p>
                            <Button
                                onClick={() => {
                                    handleVerify(true);
                                }}
                                className='w-full'>
                                Complete Verification
                            </Button>
                        </div>
                    )}

                    {socketStatus === 'connected' && (
                        <div className='space-y-4'>
                            <p className='text-gray-600'>Ready to verify</p>
                            <Button
                                onClick={() => {
                                    handleVerify(false);
                                }}
                                className='w-full'>
                                Fail Verification
                            </Button>
                        </div>
                    )}

                    {status === 'verified' && <p className='text-green-600'>Verification complete! You can close this page.</p>}

                    {status === 'failed' && <p className='text-red-600'>Verification failed. Please try again.</p>}

                    {socketStatus === 'disconnected' && <p className='text-red-600'>Connection lost. Please try scanning the QR code again.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
