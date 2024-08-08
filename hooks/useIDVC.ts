"use client";

import { useState, useEffect, useRef } from "react";
import IDVC from "@idscan/idvc2";
import { toast } from "@/components/ui/use-toast";

export const useIDVC = (onVerificationComplete: (result: any) => void) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [error, setError] = useState("");
    const [idvcInstance, setIdvcInstance] = useState<any>(null);

    const cssLinkRef = useRef<HTMLLinkElement | null>(null);

    useEffect(() => {
        const handleChunkError = (e: ErrorEvent) => {
            if (e.message.includes("Loading chunk")) {
                setError(
                    "An error occurred while loading the application. Please reload the page."
                );
            }
        };

        window.addEventListener("error", handleChunkError);

        return () => {
            window.removeEventListener("error", handleChunkError);
            removeCssFile();
        };
    }, []);

    const loadCssFile = () => {
        if (!cssLinkRef.current) {
            const link = document.createElement("link");
            link.href = "/idScan.css";
            link.rel = "stylesheet";
            link.type = "text/css";
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
        loadCssFile();

        const instance = new IDVC({
            el: "videoCapturingEl",
            licenseKey: process.env.NEXT_PUBLIC_IDSCAN_LICENSE_KEY,
            networkUrl: "networks/",
            chunkPublicPath: "/networks/",
            resizeUploadedImage: 1200,
            fixFrontOrientAfterUpload: false,
            autoContinue: true,
            isShowDocumentTypeSelect: false,
            useCDN: false,
            isShowGuidelinesButton: false,
            showSubmitBtn: false,
            language: "en",
            realFaceMode: "auto",
            processingImageFormat: "jpeg",
            documentTypes: [
                {
                    type: "ID",
                    steps: [
                        {
                            type: "front",
                            name: "Document Front",
                            mode: { uploader: true, video: true },
                        },
                        {
                            type: "pdf",
                            name: "Document PDF417 Barcode",
                            mode: { uploader: true, video: true },
                        },
                        {
                            type: "face",
                            name: "Face",
                            mode: { uploader: true, video: true },
                        },
                    ],
                },
            ],
            onCameraError(data: any) {
                console.error("Camera error:", data);
                toast({
                    title: "An error occurred while accessing the camera. Please reload the page.",
                    duration: 5000,
                    variant: "destructive",
                });
            },
            // In the submit function of the IDVC instance

            submit: async (data: any) => {
                instance.showSpinner(true);
                setIsLoading(true);

                try {
                    // const result = await processIDVCData(data);
                    onVerificationComplete(data);
                    toast({
                        title: "Verification completed successfully!",
                        duration: 5000,
                        variant: "success",
                    });
                } catch (err) {
                    console.error("Verification error:", err);
                    toast({
                        title: "An error occurred while processing your verification request. Please try again.",
                        duration: 5000,
                        variant: "destructive",
                    });
                } finally {
                    instance.showSpinner(false);
                    setIsLoading(false);
                    setIsProcessStarted(false);
                    removeCssFile();

                    const videoCapturingEl =
                        document.getElementById("videoCapturingEl");
                    if (videoCapturingEl) {
                        videoCapturingEl.style.display = "none";
                    } else {
                        console.warn("Video capturing element not found");
                    }
                }
            },
        });

        setIdvcInstance(instance);
    };

    const resetProcess = () => {
        if (idvcInstance) {
            idvcInstance.resetAllSteps();
        }
        setIsProcessStarted(false);
        setIsLoading(false);
        setError("");
        removeCssFile();
    };

    return {
        isLoading,
        isProcessStarted,
        error,
        startIDVCProcess,
        resetProcess,
        loadCssFile,
        removeCssFile,
    };
};

async function processIDVCData(data: any) {
    // ... (existing data processing logic)
    // This function should handle the data processing and API call
    // Return the result from the API call
}
