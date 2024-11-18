'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), { ssr: false });

export default function DesktopVerificationComponent() {
    const { error, status, mobileUrl, handleRetry } = useSocket('https://auxiliary-service.onrender.com');

    return (
        <Card className='mx-auto mt-8 w-full max-w-md'>
            <CardContent className='p-6'>
                <div className='space-y-4 text-center'>
                    <h2 className='font-bold text-2xl'>Desktop Verification</h2>

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
