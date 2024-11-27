'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface PDFViewerComponentProps {
    url: string;
}

export default function PDFViewerComponent({ url }: PDFViewerComponentProps) {
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
    const encodedUrl = encodeURIComponent(url);
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

    const handleLoad = useCallback(() => {
        setStatus('success');
    }, []);

    const handleError = useCallback(() => {
        setStatus('error');
    }, []);

    const handleRetry = useCallback(() => {
        setStatus('loading');
        const iframe = document.querySelector('iframe');
        if (iframe) {
            iframe.src = googleDocsUrl;
        }
    }, [googleDocsUrl]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (status === 'loading') {
                setStatus('error');
            }
        }, 10000); // Set error after 10 seconds if still loading

        return () => clearTimeout(timer);
    }, [status]);

    return (
        <div className='relative h-full w-full overflow-hidden rounded-lg bg-neutral-100'>
            {status === 'loading' && (
                <div className='absolute inset-0 flex flex-col items-center justify-center gap-4'>
                    <Loader2 className='h-8 w-8 animate-spin text-neutral-500' />
                    Loading PDF
                </div>
            )}
            {status === 'error' && (
                <div className='absolute inset-0 flex flex-col items-center justify-center p-4'>
                    <p className='mb-4 text-center '>Failed to load PDF. Please try again or download the file.</p>
                    <div className='flex space-x-4'>
                        <Button onClick={handleRetry} variant='outline' className='flex items-center'>
                            <RefreshCcw className='mr-2 h-4 w-4' /> Retry
                        </Button>
                        <Button onClick={() => window.open(url, '_blank')} variant='outline' className='flex items-center'>
                            <Download className='mr-2 h-4 w-4' /> Download PDF
                        </Button>
                    </div>
                </div>
            )}
            <iframe title='PDF Viewer' src={googleDocsUrl} className='h-full w-full border-none' onLoad={handleLoad} onError={handleError} allowFullScreen />
        </div>
    );
}
