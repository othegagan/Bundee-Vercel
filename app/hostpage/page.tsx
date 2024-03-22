'use client';

import dynamic from 'next/dynamic';

const HostPageSearchBox = dynamic(() => import('./HostPageSearchBox'), { ssr: false });

export default function ClientComponentExample() {
    return (
        <div>
            <HostPageSearchBox />
        </div>
    );
}
