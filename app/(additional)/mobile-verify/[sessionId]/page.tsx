'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { Loader2 } from 'lucide-react';

interface PageProps {
    params: {
        sessionId: string;
    };
}

export default function MobileVerifyPage({ params }: PageProps) {
    const { sessionId } = params;
    const { error, status, handleVerify, handleRetry } = useSocket({
        serverUrl: 'https://auxiliary-service.onrender.com',
        isMobile: true,
        sessionId
    });

    return (
        <Card className='mx-auto mt-8 w-full max-w-md'>
            <CardContent className='p-6'>
                <div className='space-y-4 text-center'>
                    <h2 className='font-bold text-2xl'>Mobile Verification</h2>

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
                            <p className='text-muted-foreground'>Ready to verify</p>
                            <Button onClick={() => handleVerify(true)} className='w-full'>
                                Complete Verification
                            </Button>
                            <Button onClick={() => handleVerify(false)} variant='outline' className='w-full'>
                                Fail Verification
                            </Button>
                        </div>
                    )}

                    {status === 'verified' && <p className='font-semibold text-green-600'>Verification complete! You can close this page.</p>}

                    {status === 'failed' && (
                        <div className='space-y-4'>
                            <p className='text-destructive'>Verification failed.</p>
                            <Button onClick={handleRetry}>Try Again</Button>
                        </div>
                    )}

                    {status === 'error' && <Button onClick={handleRetry}>Retry Connection</Button>}
                </div>
            </CardContent>
        </Card>
    );
}
