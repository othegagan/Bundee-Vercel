'use client';

import dynamic from 'next/dynamic';

const MeasureOneComponent = dynamic(() => import('./MeasureOneComponent'), {
    ssr: false
});

export default function InsurancePage({ searchParams }: { searchParams: { [key: string]: string } }) {
    let decodedToken = decodeURIComponent(searchParams.token);
    // Replace spaces with the original + character
    decodedToken = decodedToken.replace(/ /g, '+');

    return <MeasureOneComponent searchParams={{ ...searchParams, token: decodedToken }} />;
}
