'use client';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { useIDVCProcess } from '@/hooks/useIDVCProcess';
import { useUpdateDriverProfile } from '@/hooks/useUpdateDriverProfile';
import { decryptingData } from '@/lib/decrypt';
import { extractBase64Image } from '@/lib/utils';
import { CircleCheckIcon } from '@/public/icons';
import { CircleX } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function IDScan() {
    const router = useRouter();
    const params = useSearchParams();

    const token = params.get('token');
    const callbackUrl = params.get('callbackUrl');
    const cssLinkRef = useRef<HTMLLinkElement | null>(null);

    const { isProcessStarted, processError, startIDVCProcess, idvcInstance, resetProcess } = useIDVCProcess(cssLinkRef);

    const { updateError, handleUpdateDriverProfile, isUpdating, isVerifying, isLicenseApproved, isUpdateSuccessful } = useUpdateDriverProfile();

    const updateQueryParam = (status: 'true' | 'false') => {
        const params = new URLSearchParams(window.location.search);
        params.set('drivinglicenseverified', status);
        const updatedURL = `${window.location.pathname}?${params.toString()}`;
        router.push(updatedURL);
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
            await handleUpdateDriverProfile(payload, decryptedUserId);
            resetProcess();
        });
    };

    return (
        <ClientOnly>
            <div className={`flex h-[100dvh] flex-col items-center overflow-x-hidden p-5 ${isProcessStarted ? 'overflow-y-auto' : ''}`}>
                {!isProcessStarted && !isUpdating && !isVerifying && !isUpdateSuccessful && !updateError && (
                    <div className='my-auto flex flex-col items-center gap-5 text-center'>
                        <h3 className=' font-bold text-2xl'>Verify Driving Licence</h3>
                        <p className=' max-w-2xl text-balance '>Please have your driver's license ready and make sure your camera permissions are enabled.</p>
                        <p className='mb-6 max-w-2xl text-balance '>Click the start button to begin the verification process.</p>
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

                <ErrorDisplay error={processError || updateError} />

                <SuccessDisplay success={isUpdateSuccessful} isApproved={isLicenseApproved} callbackUrl={callbackUrl} />
            </div>
        </ClientOnly>
    );
}

function ProcessStartButton({ isVisible, onStart }) {
    if (!isVisible) return null;

    return (
        <Button onClick={onStart} size='lg' className='w-full max-w-[300px]'>
            Start Licence Verification
        </Button>
    );
}

function ErrorDisplay({ error }) {
    if (!error) return null;

    return (
        <div className='my-auto flex flex-col items-center justify-center gap-6 text-center'>
            <CircleX className='size-20 text-red-500' />

            <h1 className='font-bold text-2xl'>Verification failed..!</h1>
            <p className='max-w-[600px] text-balance'>{error}</p>

            <Button
                variant='black'
                size='lg'
                onClick={() => {
                    // remove drivinglicenseverified query param
                    const params = new URLSearchParams(window.location.search);
                    params.delete('drivinglicenseverified');
                    const updatedURL = `${window.location.pathname}?${params.toString()}`;
                    window.history.replaceState({}, '', updatedURL);
                    window.location.reload();
                }}>
                Retry
            </Button>
        </div>
    );
}

function SuccessDisplay({ success, isApproved, callbackUrl }) {
    if (!success || !isApproved) return null;

    return (
        <div className='my-auto flex flex-col items-center gap-6 text-center'>
            <CircleCheckIcon className='size-24 text-green-500' />
            <h1 className='font-bold text-2xl'>Verification Successful..!</h1>
            <p className='max-w-[600px] text-balance'>Thanks for verifying your driving licence with MyBundee.</p>

            {callbackUrl && (
                <Link href={callbackUrl} className='mt-8 rounded-md bg-black p-2 px-16 text-white hover:bg-black/80'>
                    Go Back
                </Link>
            )}
        </div>
    );
}
