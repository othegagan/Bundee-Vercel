'use client';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { useIDVCProcess } from '@/hooks/useIDVCProcess';
import { useUpdateDriverProfile } from '@/hooks/useUpdateDriverProfile';
import { decryptingData } from '@/lib/decrypt';
import { extractBase64Image } from '@/lib/utils';
import { CircleX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function DLMobile() {
    const params = useSearchParams();

    const token = params.get('token');
    const cssLinkRef = useRef<HTMLLinkElement | null>(null);

    const { isProcessStarted, processError, startIDVCProcess, idvcInstance, resetProcess } = useIDVCProcess(cssLinkRef);

    const { updateError, handleUpdateDriverProfile, isUpdating, isVerifying, isLicenseApproved, isUpdateSuccessful } = useUpdateDriverProfile();

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

    if (!token) {
        return <ErrorDisplay error={'No token found. Please go back to the mobile app and try again.'} />;
    }

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

                <SuccessDisplay success={isUpdateSuccessful} isApproved={isLicenseApproved} />
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

function SuccessDisplay({ success, isApproved }) {
    if (!success || !isApproved) return null;

    return (
        <div className='my-auto flex flex-col items-center gap-6 text-center'>
            <svg className='size-24 text-green-500' viewBox='0 0 126 126' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                    d='M54.249 74.2495L40.8115 60.812C39.6657 59.6662 38.2074 59.0933 36.4365 59.0933C34.6657 59.0933 33.2074 59.6662 32.0615 60.812C30.9157 61.9578 30.3428 63.4162 30.3428 65.187C30.3428 66.9578 30.9157 68.4162 32.0615 69.562L49.874 87.3745C51.124 88.6245 52.5824 89.2495 54.249 89.2495C55.9157 89.2495 57.374 88.6245 58.624 87.3745L93.9365 52.062C95.0823 50.9162 95.6553 49.4578 95.6553 47.687C95.6553 45.9162 95.0823 44.4578 93.9365 43.312C92.7907 42.1662 91.3323 41.5933 89.5615 41.5933C87.7907 41.5933 86.3323 42.1662 85.1865 43.312L54.249 74.2495ZM62.999 125.499C54.3532 125.499 46.2282 123.859 38.624 120.578C31.0199 117.296 24.4053 112.843 18.7803 107.218C13.1553 101.593 8.70215 94.9787 5.4209 87.3745C2.13965 79.7703 0.499023 71.6453 0.499023 62.9995C0.499023 54.3537 2.13965 46.2287 5.4209 38.6245C8.70215 31.0203 13.1553 24.4058 18.7803 18.7808C24.4053 13.1558 31.0199 8.70264 38.624 5.42139C46.2282 2.14014 54.3532 0.499512 62.999 0.499512C71.6448 0.499512 79.7699 2.14014 87.374 5.42139C94.9782 8.70264 101.593 13.1558 107.218 18.7808C112.843 24.4058 117.296 31.0203 120.577 38.6245C123.858 46.2287 125.499 54.3537 125.499 62.9995C125.499 71.6453 123.858 79.7703 120.577 87.3745C117.296 94.9787 112.843 101.593 107.218 107.218C101.593 112.843 94.9782 117.296 87.374 120.578C79.7699 123.859 71.6448 125.499 62.999 125.499ZM62.999 112.999C76.9573 112.999 88.7803 108.156 98.4678 98.4682C108.155 88.7807 112.999 76.9578 112.999 62.9995C112.999 49.0412 108.155 37.2183 98.4678 27.5308C88.7803 17.8433 76.9573 12.9995 62.999 12.9995C49.0407 12.9995 37.2178 17.8433 27.5303 27.5308C17.8428 37.2183 12.999 49.0412 12.999 62.9995C12.999 76.9578 17.8428 88.7807 27.5303 98.4682C37.2178 108.156 49.0407 112.999 62.999 112.999Z'
                    fill='currentColor'
                />
            </svg>

            <h1 className='font-bold text-2xl'>Verification Successful..!</h1>
            <p className='max-w-[600px] text-balance'>
                Thanks for verifying your driving licence with MyBundee. Please return to the mobile app to proceed further.
            </p>
        </div>
    );
}
