'use client';

import dynamic from 'next/dynamic';

const DLMainComponent = dynamic(() => import('./DLMainComponent'), {
    ssr: false
});

export default function Page() {
    return <DLMainComponent />;
}
