'use client';

import { useState, useEffect, useRef } from 'react';
import IDVC from '@idscan/idvc2';
import { useRouter } from 'next/navigation';

export const useIDVC = (handleVerificationComplete) => {
    const router = useRouter();
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

    const loadCssFile = () => {
        if (!cssLinkRef.current) {
            const link = document.createElement('link');
            link.href = '/idScan.css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.head.appendChild(link);
            cssLinkRef.current = link;
        }
    };

    const removeCssFile = () => {
        if (cssLinkRef.current) {
            document.head.removeChild(cssLinkRef.current);
            cssLinkRef.current = null;
        }
    };

    const startIDVCProcess = () => {
        setIsProcessStarted(true);

        setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.set('drivinglicenseverified', 'true');

            const url = `${window.location.pathname}?${params.toString()}`;
            router.push(url);
        }, 3000);

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
                await handleVerificationComplete(data);
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

    return {
        isProcessStarted,
        error,
        startIDVCProcess,
        resetProcess
    };
};
