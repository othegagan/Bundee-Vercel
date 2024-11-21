'use client';

import dynamic from 'next/dynamic';

const DesktopVerificationComponent = dynamic(() => import('./DesktopVerificationComponent'), {
    ssr: false
});

export default function Page() {
    return <DesktopVerificationComponent />;
}
