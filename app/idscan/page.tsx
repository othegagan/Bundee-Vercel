'use client';

import dynamic from 'next/dynamic';

const IDScanComponent = dynamic(() => import('./IDScanComponent'), {
    ssr: false
});

export default function IDScanPage() {
    return <IDScanComponent />;
}
