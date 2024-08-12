'use client';

import { extractBase64Image } from '@/lib/utils';
import IDVC from '@idscan/idvc2';
import { useEffect, useRef, useState } from 'react';

export const useIDVC = () => {
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [error, setError] = useState('');
    const [idvcInstance, setIdvcInstance] = useState<any>(null);

    const cssLinkRef = useRef<HTMLLinkElement | null>(null);

    useEffect(() => {
        const handleChunkError = (e: ErrorEvent) => {
            if (e.message.includes('Loading chunk')) {
                setError('An error occurred while loading the application. Please reload the page.');
            }
        };

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

        const videoCapturingEl = document.getElementById('videoCapturingEl');
        if (!videoCapturingEl) {
            console.error('Video capturing element not found');
            setError('Video capturing element not found. Please try again.');
            return;
        }

        const instance = new IDVC({
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
                        {
                            type: 'front',
                            name: 'Document Front',
                            mode: { uploader: true, video: true }
                        },
                        {
                            type: 'pdf',
                            name: 'Document PDF417 Barcode',
                            mode: { uploader: true, video: true }
                        },
                        {
                            type: 'face',
                            name: 'Face',
                            mode: { uploader: true, video: true }
                        }
                    ]
                }
            ],
            onCameraError(data: any) {
                console.error('Camera error:', data);
                setError('An error occurred while accessing the camera. Please reload the page.');
            },
            submit: async (data: any) => {
                idvcInstance.showSpinner(true);
                const payload = processData(data);



                idvcInstance.showSpinner(false);
                setIsProcessStarted(false);
                removeCssFile();

                const videoCapturingEl = document.getElementById('videoCapturingEl');
                if (videoCapturingEl) {
                    videoCapturingEl.style.display = 'none';
                }

            }
        });

        setIdvcInstance(instance);
    };

    const resetProcess = () => {
        if (idvcInstance) {
            idvcInstance.resetAllSteps();
        }
        setIsProcessStarted(false);
        setError('');
        removeCssFile();
    };

    function processData(data: any) {
        // Extract steps from the result
        const frontStep = data.steps.find((item: any) => item.type === 'front');
        const pdfStep = data.steps.find((item: any) => item.type === 'pdf');
        const faceStep = data.steps.find((item: any) => item.type === 'face');

        // Ensure that all steps are present
        if (!frontStep || !pdfStep || !faceStep) {
            throw new Error('One or more required steps (front, pdf, face) are missing.');
        }

        // Extract images from the steps
        const frontImageBase64 = extractBase64Image(frontStep.img);
        const backImageBase64 = extractBase64Image(pdfStep.img);
        const faceImageBase64 = extractBase64Image(faceStep.img);

        // Extract track string and capture method
        const rawTrackString = pdfStep.trackString || '';
        const [trackStringData, barcodeParams] = rawTrackString.split('.');

        const captureMethod = `${+frontStep.isAuto}${+pdfStep.isAuto}${+faceStep.isAuto}`;

        // Construct the payload
        const payload = {
            frontImageBase64,
            backOrSecondImageBase64: backImageBase64,
            faceImageBase64,
            documentType: 1,
            trackString: {
                data: trackStringData || '',
                barcodeParams: barcodeParams || ''
            },
            overriddenSettings: {
                isOCREnabled: true,
                isBackOrSecondImageProcessingEnabled: true,
                isFaceMatchEnabled: true
            },
            metadata: {
                captureMethod
            }
        };

        return payload;
    }

    return {
        isProcessStarted,
        error,
        startIDVCProcess,
        resetProcess
    };
};
