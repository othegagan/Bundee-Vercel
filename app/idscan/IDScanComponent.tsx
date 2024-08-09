'use client';

import ClientOnly from '@/components/ClientOnly';
import { useIDVC } from '@/hooks/useIDVC';
import { decryptingData } from '@/lib/decrypt';
import { delay } from '@/lib/utils';
import '@idscan/idvc2/dist/css/idvc.css';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function IDScanComponent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [submitted, setSubmitted] = useState(false);

    const { isProcessStarted, error, startIDVCProcess, resetProcess } = useIDVC(handleVerificationComplete);

    async function handleVerificationComplete(result: any) {
        console.log('Verification result:', result);
        await delay(10000);
        const userId = decryptingData(token);
        setSubmitted(true);

        // Add any logic you need to process the decrypted userId
    }

    return (
        <ClientOnly>
            <div
                className={`flex flex-col items-center justify-center p-5 h-[100dvh]  overflow-x-hidden ${isProcessStarted ? 'overflow-y-auto' : ''}`}>
                {!isProcessStarted && (
                    <>
                        <h3>License Verification</h3>
                        <p className='text-center max-w-2xl'>
                            Please have your license ready and enable camera permissions. <br /> Click the start button to begin the
                            verification process
                        </p>
                    </>
                )}
                <div
                    id='videoCapturingEl'
                    className={`w-full max-w-[500px] my-5 bg-white rounded-md  relative ${isProcessStarted ? 'h-full' : 'h-0'}`}
                />
                {!isProcessStarted && (
                    <button type='button' onClick={startIDVCProcess} className='idScan-btn' style={{ maxWidth: '400px' }}>
                        Start License Verification
                    </button>
                )}
                {error && <div className='text-red-500'>{error}</div>}
            </div>
        </ClientOnly>
    );
}
