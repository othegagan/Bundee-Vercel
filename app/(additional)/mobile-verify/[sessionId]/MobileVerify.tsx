'use client';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { useIDVCProcess } from '@/hooks/useIDVCProcess';
import { useUpdateDriverProfile } from '@/hooks/useUpdateDriverProfile';
import { decryptingData } from '@/lib/decrypt';
import { extractBase64Image } from '@/lib/utils';
import { CircleCheckIcon, LogoIcon } from '@/public/icons';
import { CircleX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

interface SocketMessage {
    type: string;
    sessionId?: string;
    verified?: boolean;
    [key: string]: any;
}

const useMobileSocket = (sessionId: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<string>('connecting');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const socketio = io(process.env.NEXT_PUBLIC_AUXILIARY_SERVICE_BASEURL, {
            reconnectionAttempts: 3,
            timeout: 10000,
            transports: ['websocket', 'polling']
        });

        socketio.on('connect', () => {
            console.log('Connected to WebSocket');
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

        return () => {
            socketio.disconnect();
        };
    }, [sessionId]);

    const emitMessage = (message: SocketMessage) => {
        if (socket) {
            socket.emit('message', JSON.stringify(message));
        } else {
            console.error('Socket not initialized');
        }
    };

    return { status, error, emitMessage, setStatus, setError };
};

export default function MobileVerify({ sessionId }) {
    const params = useSearchParams();
    const { status, error, emitMessage, setStatus, setError } = useMobileSocket(sessionId);
    const [interactionOccurred, setInteractionOccurred] = useState(false);

    const token = params.get('token');
    const cssLinkRef = useRef<HTMLLinkElement | null>(null);

    const { isProcessStarted, processError, startIDVCProcess, idvcInstance, resetProcess } = useIDVCProcess(cssLinkRef);

    const { updateError, handleUpdateDriverProfile, isUpdating, isVerifying, isLicenseApproved, isUpdateSuccessful } = useUpdateDriverProfile();

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!interactionOccurred) {
                emitMessage({
                    type: 'DESTROY_SESSION',
                    sessionId
                });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [interactionOccurred, emitMessage, sessionId]);

    const handleVerify = (isVerified: boolean) => {
        setInteractionOccurred(true);
        emitMessage({
            type: 'VERIFY_STATUS',
            sessionId,
            verified: isVerified
        });
        setStatus(isVerified ? 'verified' : 'failed');
    };

    useEffect(() => {
        const loadCssFile = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/@idscan/idvc2/dist/css/idvc.css';
            link.id = 'idvcCss';
            document.head.appendChild(link);
            cssLinkRef.current = link;
        };

        const handleChunkError = (e: ErrorEvent) => {
            if (e.message.includes('Loading chunk')) {
                // Handle chunk loading error
            }
        };

        loadCssFile();
        window.addEventListener('error', handleChunkError);

        return () => {
            window.removeEventListener('error', handleChunkError);
            if (cssLinkRef.current) {
                document.head.removeChild(cssLinkRef.current);
            }
        };
    }, []);

    const handleStartProcess = () => {
        startIDVCProcess(async (data: any) => {
            const decryptedUserId = token ? decryptingData(token.trim()) : undefined;

            const frontStep = data.steps.find((item: any) => item.type === 'front');
            const pdfStep = data.steps.find((item: any) => item.type === 'pdf');
            const faceStep = data.steps.find((item: any) => item.type === 'face');

            if (!frontStep || !pdfStep || !faceStep) {
                throw new Error('One or more required steps (front, pdf, face) are missing.');
            }

            const frontImageBase64 = extractBase64Image(frontStep.img);
            const backImageBase64 = extractBase64Image(pdfStep.img);
            const faceImageBase64 = extractBase64Image(faceStep.img);

            const [trackStringData, barcodeParams] = (pdfStep.trackString || '').split('.');
            const captureMethod = `${+frontStep.isAuto}${+pdfStep.isAuto}${+faceStep.isAuto}`;

            const payload = {
                frontImageBase64,
                backOrSecondImageBase64: backImageBase64,
                faceImageBase64,
                documentType: 1,
                trackString: { data: trackStringData || '', barcodeParams: barcodeParams || '' },
                overriddenSettings: { isOCREnabled: true, isBackOrSecondImageProcessingEnabled: true, isFaceMatchEnabled: true },
                metadata: { captureMethod }
            };
            const response = await handleUpdateDriverProfile(payload, decryptedUserId);
            if (response.success) {
                handleVerify(!!response.isApproved);
            } else {
                handleVerify(false);
            }
            resetProcess();
        });
    };

    return (
        <ClientOnly>
            <div className='fixed top-10 left-[10%]'>
                <LogoIcon />
            </div>
            <div className={`flex h-[100dvh] flex-col items-center overflow-x-hidden p-5 ${isProcessStarted ? 'overflow-y-auto' : ''}`}>
                {status === 'connecting' && (
                    <div className='my-auto flex flex-col gap-5'>
                        <img src='./images/car_loading.gif' alt='loading' className='w-52' />
                        <h3 className='font-bold text-3xl'>Connecting your device</h3>
                        <p className=' max-w-[600px] text-lg'>Your connection is being established. </p>
                    </div>
                )}

                {!isProcessStarted && !isUpdating && !isVerifying && !isUpdateSuccessful && !updateError && status === 'connected' && (
                    <div className='my-auto flex flex-col gap-5'>
                        <h3 className=' font-bold text-3xl'>Verify Driver’s Licence</h3>
                        <p className=' max-w-2xl '>Please have your driver's license ready and make sure your camera permissions are enabled.</p>
                        <p className='mb-6 max-w-2xl text-balance '>Click the Begin Verification button to begin the verification process.</p>
                        <ProcessStartButton
                            isVisible={!isProcessStarted && !isUpdating && !isVerifying && !isUpdateSuccessful && !updateError}
                            onStart={handleStartProcess}
                        />
                    </div>
                )}

                {!isUpdateSuccessful && !updateError && (
                    <div
                        id='videoCapturingEl'
                        className={`relative my-5 w-full max-w-[500px] rounded-md bg-white ${isProcessStarted && !isUpdating && !isVerifying && !isUpdateSuccessful ? '' : 'h-0'}`}
                    />
                )}

                {status === 'failed' && <ErrorDisplay error={processError || updateError} />}

                <SuccessDisplay success={status === 'verified'} />
            </div>
        </ClientOnly>
    );
}

function ProcessStartButton({ isVisible, onStart }) {
    if (!isVisible) return null;

    return (
        <Button onClick={onStart} size='lg' className='w-full max-w-[300px] rounded-full lg:max-w-[512px]'>
            Begin Verification
        </Button>
    );
}

function ErrorDisplay({ error }) {
    if (!error) return null;

    return (
        <div className='my-auto flex flex-col items-center justify-center gap-6 text-center'>
            <CircleX className='size-20 text-red-500' />
            <h1 className='font-bold text-2xl'>Verification failed!</h1>
            <p className='max-w-[600px] text-balance'>{error}</p>
        </div>
    );
}

function SuccessDisplay({ success }) {
    if (!success) return null;

    return (
        <div className='my-auto flex flex-col items-center gap-6 text-center'>
            <CircleCheckIcon className='mb-6 size-24 text-[#85A80F]' />
            <h1 className='font-bold text-2xl'>Verification Successful!</h1>
            <p className='max-w-[600px] text-balance'>Your documents are verified. Please switch to your desktop to and countinue.</p>
        </div>
    );
}
