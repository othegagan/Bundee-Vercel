'use client';

import dynamic from 'next/dynamic';

const IDScanComponent = dynamic(() => import('./IDScanComponent'), {
    ssr: false
});

export default function IDScanPage({ searchParams }: { searchParams: { [key: string]: string } }) {
    let decodedToken = decodeURIComponent(searchParams.token);
    // Replace spaces with the original + character
    decodedToken = decodedToken.replace(/ /g, '+');

    return <IDScanComponent searchParams={{ ...searchParams, token: decodedToken }} />;
}
