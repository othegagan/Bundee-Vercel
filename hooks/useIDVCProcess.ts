'use client';

import IDVC from '@idscan/idvc2';
import { type MutableRefObject, useRef, useState } from 'react';

export function useIDVCProcess(cssLinkRef: MutableRefObject<HTMLLinkElement | null>) {
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [processError, setProcessError] = useState('');
    const idvcInstanceRef = useRef<any>(null);

    const removeCssFile = () => {
        if (cssLinkRef.current) {
            document.head.removeChild(cssLinkRef.current);
            cssLinkRef.current = null;
        }
    };

    const startIDVCProcess = (onSubmit: (data: any) => Promise<void>) => {
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
                    await onSubmit(data);
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

        idvcInstanceRef.current = idvcInstance;
    };

    const resetProcess = () => {
        if (idvcInstanceRef.current) {
            idvcInstanceRef.current.resetAllSteps();
        }
        setIsProcessStarted(false);
        setProcessError('');
        removeCssFile();
    };

    return {
        isProcessStarted,
        processError,
        startIDVCProcess,
        idvcInstance: idvcInstanceRef.current,
        resetProcess
    };
}
