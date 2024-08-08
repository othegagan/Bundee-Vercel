'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useIDVC } from '@/hooks/useIDVC';
import { useEffect } from 'react';
import ClientOnly from '@/components/ClientOnly';

export default function IDScanComponent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleVerificationComplete = (result: any) => {
        console.log('Verification result:', result);

        window.close();
        // Handle the verification result (e.g., update UI, navigate to a new page, etc.)
    };

    const { isLoading, isProcessStarted, error, startIDVCProcess, resetProcess, loadCssFile, removeCssFile } =
        useIDVC(handleVerificationComplete);

    useEffect(() => {
        if (isProcessStarted) {
            loadCssFile();
        } else {
            removeCssFile();
        }

        return () => {
            removeCssFile();
        };
    }, [isProcessStarted, loadCssFile, removeCssFile]);

    return (
        <ClientOnly>
            <div className='h-[calc(100dvh-10px)] flex flex-col overflow-y-auto items-center py-10 px-4  '>
                {!isProcessStarted && (
                    <>
                        <h3>License Verification</h3>
                        <div className='text-center'>
                            <p>
                                You are able to start the validation process. <br /> Grab your license and activate the permissions for the
                                camera.
                            </p>
                        </div>
                    </>
                )}

                <div id='videoCapturingEl' className='w-full max-w-[500px] mt-6' />

                {!isProcessStarted && !isLoading && (
                    <Button variant='black' type='button' onClick={startIDVCProcess} disabled={isLoading}>
                        Start License Validation
                    </Button>
                )}
                {isLoading && <div>Loading...</div>}
                {error && <div>{error}</div>}

                {/* {isProcessStarted && !isLoading && (
                <Button variant='secondary' type='button' onClick={resetProcess}>
                    Reset Process
                </Button>
            )} */}
            </div>
        </ClientOnly>
    );
}
