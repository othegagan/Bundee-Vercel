'use client';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
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
                        { type: 'front', name: 'Document Front', mode: { uploader: false, video: true } },
                        { type: 'pdf', name: 'Document PDF417 Barcode', mode: { uploader: false, video: true } },
                        { type: 'face', name: 'Face', mode: { uploader: false, video: true } }
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
            <div className={`flex h-[100dvh] flex-col items-center overflow-x-hidden p-5 ${isProcessStarted ? 'overflow-y-auto' : ''}`}>
                {!isProcessStarted && !isUpdatingDB && !isVerifying && !success && !error && (
                    <>
                        <h3 className='mb-4 font-bold text-2xl'>License Verification</h3>
                        <p className='mb-6 max-w-2xl text-center'>
                            Please have your license ready and enable camera permissions. <br className='hidden lg:block' /> Click the start button to begin the
                            verification process.
                        </p>
                    </>
                )}

                {!success && !error && (
                    <div
                        id='videoCapturingEl'
                        className={`relative my-5 w-full max-w-[500px] rounded-md bg-white ${isProcessStarted && !isUpdatingDB && !isVerifying && !success ? '' : 'h-0'}`}
                    />
                )}

                {!isProcessStarted && !isUpdatingDB && !isVerifying && !success && !error && (
                    <button type='button' onClick={startIDVCProcess} className='idScan-btn' style={{ maxWidth: '400px' }}>
                        Start License Verification
                    </button>
                )}

                {(processError || error) && (
                    <div className='my-10 mt-4 flex max-w-2xl flex-col items-center justify-center gap-6 text-center'>
                        <CircleX className='size-10 text-red-500' />
                        <p>{processError || error}</p>

                        {callback ? (
                            <div className='flex items-center gap-6'>
                                <Link href={callback} className=' rounded-md border p-2 text-black hover:bg-black/10'>
                                    OK, Go Back
                                </Link>
                            </div>
                        ) : (
                            <Button
                                variant='black'
                                onClick={() => {
                                    window.location.reload();
                                }}>
                                Retry
                            </Button>
                        )}
                    </div>
                )}

                {success && isApproved && !error && (
                    <div className='my-10 mt-4 flex max-w-2xl flex-col items-center justify-center gap-6 text-center'>
                        <CircleCheck className='size-10 text-green-500' />

                        {callback ? (
                            <>
                                <p>Your driving licence has been successfully added to your profile.</p>
                                <Link href={callback} className='mt-4 rounded-md bg-black p-2 text-white hover:bg-black/80'>
                                    OK, Go Back
                                </Link>
                            </>
                        ) : (
                            <>
                                <p>Thanks for verifying your driving license with MyBundee. Please return to the mobile app to proceed further.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </ClientOnly>
    );
}
