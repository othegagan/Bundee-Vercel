'use client';

import ClientOnly from '@/components/ClientOnly';
import { useIdVerification } from '@/hooks/useIdVerification';
import { getSession } from '@/lib/auth';
import { decryptingData } from '@/lib/decrypt';
import { extractBase64Image } from '@/lib/utils';
import { updateDrivingLicence } from '@/server/userOperations';
import IDVC from '@idscan/idvc2';
import { CircleCheck, CircleX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function useUpdateDriverProfile() {
    const router = useRouter();
    const [isUpdatingDB, setIsUpdatingDB] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { verifyDrivingLicence, isVerifying, error: verificationError } = useIdVerification();
    const [isApproved, setIsApproved] = useState(false);

    const updateURL = (status: 'true' | 'false') => {
        const params = new URLSearchParams(window.location.search);
        params.set('drivinglicenseverified', status);
        const url = `${window.location.pathname}?${params.toString()}`;
        router.push(url);
    };

    const updateDriverProfile = async (idScanPayload: any, decryptedUserId?: string) => {
        setIsUpdatingDB(true);
        setError(null);
        setSuccess(false);

        try {
            const session = await getSession();
            const userId = Number(decryptedUserId) || session.userId;

            const { isApproved, requestId } = await verifyDrivingLicence(idScanPayload, userId);

            const updatePayload = {
                userId: userId,
                idScanRequestID: requestId,
                isVerified: isApproved
            };

            const updateIDResponse = await updateDrivingLicence(updatePayload);
            if (updateIDResponse.success) {
                setSuccess(true);
                updateURL('true');
            } else {
                throw new Error(updateIDResponse.message || 'Failed to update driving profile');
            }
            setIsApproved(isApproved);

            isApproved ? updateURL('true') : updateURL('false');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred while updating your driving profile');
            updateURL('false');
        } finally {
            setIsUpdatingDB(false);
        }
    };

    return { isUpdatingDB, error: error || verificationError, success, updateDriverProfile, isVerifying, isApproved };
}

export default function IDScanComponent({ searchParams }: { searchParams: { callbackUrl?: string; token?: string } }) {
    const callback = searchParams?.callbackUrl || '';
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [processError, setProcessError] = useState('');
    const [idvcInstance, setIdvcInstance] = useState<any>(null);
    const cssLinkRef = useRef<HTMLLinkElement | null>(null);
    const { updateDriverProfile, isUpdatingDB, error, success, isVerifying, isApproved } = useUpdateDriverProfile();

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
                setProcessError('An error occurred while loading the application. Please reload the page.');
            }
        };

        loadCssFile();
        window.addEventListener('error', handleChunkError);

        return () => {
            window.removeEventListener('error', handleChunkError);
            removeCssFile();
        };
    }, []);

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
            // networkUrl: 'networks/',
            // chunkPublicPath: '/networks/',
            resizeUploadedImage: 1200,
            fixFrontOrientAfterUpload: false,
            autoContinue: false,
            isShowDocumentTypeSelect: false,
            useCDN: true,
            isShowGuidelinesButton: false,
            showSubmitBtn: true,
            language: 'en',
            realFaceMode: 'auto',
            processingImageFormat: 'jpeg',
            autocaptureDelay: 2000,
            //@ts-ignore
            useHeic: true,
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

                    const decryptedUserId = searchParams.token ? decryptingData(searchParams.token.toString().trim()) : undefined;
                    await updateDriverProfile(payload, decryptedUserId);
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
            <div className={`flex flex-col items-center p-5 h-[100dvh] overflow-x-hidden ${isProcessStarted ? 'overflow-y-auto' : ''}`}>
                {!isProcessStarted && !isUpdatingDB && !isVerifying && !success && !error && (
                    <>
                        <h3 className='text-2xl font-bold mb-4'>License Verification</h3>
                        <p className='text-center max-w-2xl mb-6'>
                            Please have your license ready and enable camera permissions. <br className='hidden lg:block' /> Click the start button to begin the
                            verification process.
                        </p>
                    </>
                )}

                {!success && !error && (
                    <div
                        id='videoCapturingEl'
                        className={`w-full max-w-[500px] my-5 bg-white rounded-md relative ${isProcessStarted && !isUpdatingDB && !isVerifying && !success ? '' : 'h-0'}`}
                    />
                )}

                {!isProcessStarted && !isUpdatingDB && !isVerifying && !success && !error && (
                    <button type='button' onClick={startIDVCProcess} className='idScan-btn' style={{ maxWidth: '400px' }}>
                        Start License Verification
                    </button>
                )}

                {(processError || error) && (
                    <div className='mt-4 text-center flex flex-col items-center justify-center gap-6 my-10 max-w-2xl'>
                        <CircleX className='text-red-500 size-10' />
                        <p>{processError || error}</p>

                        {callback ? (
                            <div className='flex gap-6 items-center'>
                                <Link href={callback} className=' p-2 border text-black rounded-md hover:bg-black/10'>
                                    OK, Go Back
                                </Link>
                            </div>
                        ) : (
                            <button
                                type='button'
                                onClick={() => {
                                    // @ts-ignore
                                    if (window?.FlutterWebView) {
                                        // @ts-ignore
                                        window?.FlutterWebView.postMessage('close');
                                    } else {
                                        window.close(); // Fallback for normal browsers
                                    }
                                }}
                                className='idScan-btn'
                                style={{ maxWidth: '400px' }}>
                                OK, Go Back
                            </button>
                        )}
                    </div>
                )}

                {success && isApproved && !error && (
                    <div className='mt-4 text-center flex flex-col items-center justify-center gap-6 my-10 max-w-2xl'>
                        <CircleCheck className='text-green-500 size-10' />
                        <p>Your driving licence has been successfully added to your profile.</p>

                        {callback ? (
                            <Link href={callback} className='mt-4 p-2 bg-black text-white rounded-md hover:bg-black/80'>
                                OK, Go Back
                            </Link>
                        ) : (
                            <button
                                type='button'
                                onClick={() => {
                                    // @ts-ignore
                                    if (window?.FlutterWebView) {
                                        // @ts-ignore
                                        window?.FlutterWebView.postMessage('close');
                                    } else {
                                        window.close(); // Fallback for normal browsers
                                    }
                                }}
                                className='idScan-btn'
                                style={{ maxWidth: '400px' }}>
                                OK, Go Back
                            </button>
                        )}
                    </div>
                )}
            </div>
        </ClientOnly>
    );
}
