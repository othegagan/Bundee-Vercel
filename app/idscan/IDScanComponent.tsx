'use client';

import ClientOnly from '@/components/ClientOnly';
import { verifyDrivingProfile } from '@/hooks/useDrivingProfile';
import { getSession } from '@/lib/auth';
import { decryptingData } from '@/lib/decrypt';
import { extractBase64Image } from '@/lib/utils';
import IDVC from '@idscan/idvc2';
import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function useUpdateDriverProfile() {
    const router = useRouter();
    const [isUpdatingDB, setIsUpdatingDB] = useState(false);
    const [errorUpdatingDB, setErrorUpdatingDB] = useState('');
    const [success, setSuccess] = useState(false);

    const updateURL = (status: 'true' | 'false') => {
        const params = new URLSearchParams(window.location.search);
        params.set('drivinglicenseverified', status);

        const url = `${window.location.pathname}?${params.toString()}`;
        router.push(url);
    };

    const updateDriverProfile = async (payload: any, decrpytedUserId?: string) => {
        setIsUpdatingDB(true);
        setErrorUpdatingDB('');
        setSuccess(false);

        try {
            const session = await getSession();
            const userId = Number(decrpytedUserId) || session?.userId;

            const response = await verifyDrivingProfile(payload, userId);

            if (response.success) {
                setSuccess(true);
                updateURL('true');
            } else {
                throw new Error(response.message || 'Failed to update driving profile');
            }
        } catch (error) {
            setErrorUpdatingDB(error instanceof Error ? error.message : 'An error occurred while updating your driving profile');
            updateURL('false');
        } finally {
            setIsUpdatingDB(false);
        }
    };

    return { isUpdatingDB, errorUpdatingDB, success, updateDriverProfile };
}

export function processIDScanData(data: any) {
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

    return {
        frontImageBase64,
        backOrSecondImageBase64: backImageBase64,
        faceImageBase64,
        documentType: 1,
        trackString: { data: trackStringData || '', barcodeParams: barcodeParams || '' },
        overriddenSettings: { isOCREnabled: true, isBackOrSecondImageProcessingEnabled: true, isFaceMatchEnabled: true },
        metadata: { captureMethod }
    };
}

export default function IDScanComponent({ searchParams }) {
    const callback = searchParams?.callbackUrl || '';
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [processError, setProcessError] = useState('');
    const [idvcInstance, setIdvcInstance] = useState<any>(null);
    const cssLinkRef = useRef<HTMLLinkElement | null>(null);
    const { updateDriverProfile, isUpdatingDB, errorUpdatingDB, success } = useUpdateDriverProfile();

    useEffect(() => {
        // Function to load the CSS file
        const loadCssFile = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/@idscan/idvc2/dist/css/idvc.css'; // Use the full path to the CSS file
            link.id = 'idvcCss';
            document.head.appendChild(link);
            cssLinkRef.current = link;
        };

        // Function to handle chunk errors
        const handleChunkError = (e: ErrorEvent) => {
            if (e.message.includes('Loading chunk')) {
                setProcessError('An error occurred while loading the application. Please reload the page.');
            }
        };

        // Load the CSS file
        loadCssFile();

        // Add event listener for chunk errors
        window.addEventListener('error', handleChunkError);

        // Cleanup function
        return () => {
            window.removeEventListener('error', handleChunkError);
            removeCssFile();
        };
    }, []);

    // Function to remove the CSS file
    const removeCssFile = () => {
        if (cssLinkRef.current) {
            document.head.removeChild(cssLinkRef.current);
            cssLinkRef.current = null;
        }
    };

    const startIDVCProcess = () => {
        setIsProcessStarted(true);
        setProcessError('');

        const videoCapturingEl = document.getElementById('videoCapturingEl');
        if (!videoCapturingEl) {
            setProcessError('Video capturing element not found. Please try again.');
            return;
        }

        const idvcInstance = new IDVC({
            el: 'videoCapturingEl',
            licenseKey: process.env.NEXT_PUBLIC_IDSCAN_LICENSE_KEY,
            networkUrl: 'networks/',
            chunkPublicPath: '/networks/',
            resizeUploadedImage: 1200,
            fixFrontOrientAfterUpload: false,
            autoContinue: false,
            isShowDocumentTypeSelect: false,
            useCDN: false,
            isShowGuidelinesButton: false,
            showSubmitBtn: true,
            language: 'en',
            realFaceMode: 'auto',
            processingImageFormat: 'jpeg',
            documentTypes: [
                {
                    type: 'ID',
                    steps: [
                        { type: 'front', name: 'Document Front', mode: { uploader: true, video: true } },
                        { type: 'pdf', name: 'Document PDF417 Barcode', mode: { uploader: true, video: true } },
                        { type: 'face', name: 'Face', mode: { uploader: true, video: true } }
                    ]
                }
            ],
            onCameraError(data: any) {
                console.error('Camera error:', data);
                setProcessError('An error occurred while accessing the camera. Please reload the page.');
            },
            submit: async (data: any) => {
                idvcInstance.showSpinner(true);
                try {
                    const payload = processIDScanData(data);
                    const decrpytedUserId = decryptingData(searchParams.token.toString().trim());
                    await updateDriverProfile(payload, decrpytedUserId);
                } catch (error) {
                    setProcessError(error instanceof Error ? error.message : 'An error occurred during processing');
                } finally {
                    idvcInstance.showSpinner(false);
                    setIsProcessStarted(false);
                    removeCssFile();
                    resetProcess();
                }
            }
        });

        setIdvcInstance(idvcInstance);
    };

    const resetProcess = () => {
        if (idvcInstance) {
            idvcInstance.resetAllSteps();
        }
        setIsProcessStarted(false);
        setProcessError('');
        removeCssFile();
    };

    return (
        <ClientOnly>
            <div className={`flex flex-col items-center  p-5 h-[100dvh] overflow-x-hidden ${isProcessStarted ? 'overflow-y-auto' : ''}`}>
                {!isProcessStarted && !isUpdatingDB && !success && (
                    <>
                        <h3 className='text-2xl font-bold mb-4'>License Verification</h3>
                        <p className='text-center max-w-2xl mb-6'>
                            Please have your license ready and enable camera permissions. <br className='hidden lg:block' /> Click the start button to begin the
                            verification process.
                        </p>
                    </>
                )}
                {!success && (
                    <div
                        id='videoCapturingEl'
                        className={`w-full max-w-[500px] my-5 bg-white rounded-md relative ${isProcessStarted && !isUpdatingDB && !success ? 'h-full' : 'h-0'}`}
                    />
                )}
                {!isProcessStarted && !isUpdatingDB && !success && (
                    <button type='button' onClick={startIDVCProcess} className='idScan-btn' style={{ maxWidth: '400px' }}>
                        Start License Verification
                    </button>
                )}

                {(processError || errorUpdatingDB) && (
                    <div className='text-red-500 mt-4 text-center'>
                        <p>{processError || errorUpdatingDB}</p>
                        <button type='button' onClick={resetProcess} className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
                            Retry
                        </button>
                    </div>
                )}

                {success && (
                    <div className=' mt-4 text-center flex flex-col items-center justify-center gap-6 my-10 max-w-2xl'>
                        <CircleCheck className='text-green-500 size-10' />
                        <p>Your driving licence has been successfully added to your profile.</p>

                        {callback && (
                            <Link href={callback} className='mt-4  p-2 bg-black text-white rounded-md hover:bg-black/80'>
                                OK, Go Back
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </ClientOnly>
    );
}
