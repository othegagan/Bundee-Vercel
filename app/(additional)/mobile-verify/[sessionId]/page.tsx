'use client';

import dynamic from 'next/dynamic';

const MobileVerify = dynamic(() => import('./MobileVerify'), {
    ssr: false
});

interface PageProps {
    params: {
        sessionId: string;
    };
}

export default function MobileVerifyPage({ params }: PageProps) {
    const { sessionId } = params;

    return <MobileVerify sessionId={sessionId} />;
}
