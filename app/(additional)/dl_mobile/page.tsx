'use client';

import dynamic from 'next/dynamic';

const DLMobile = dynamic(() => import('./DLMobile'), {
    ssr: false
});

export default function page() {
    return <DLMobile />;
}
