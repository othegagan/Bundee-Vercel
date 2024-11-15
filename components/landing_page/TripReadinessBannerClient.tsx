'use client';

import Link from 'next/link';
import { useState } from 'react';
import Container from '../BoxContainer';

interface TripReadinessBannerClientProps {
    tripId: string;
}

export function TripReadinessBannerClient({ tripId }: TripReadinessBannerClientProps) {
    const [showBanner, setShowBanner] = useState(true);

    if (!showBanner) return null;

    return (
        <div className='absolute top-2 w-full bg-orange-100 py-2'>
            <Container className='w-full'>
                <div className='flex flex-wrap items-center justify-between gap-4 text-nowrap text-sm'>
                    <p className='text-wrap font-medium'>Complete the readiness checklist before your trip.</p>

                    <div className='ml-auto flex items-center gap-3 md:gap-6'>
                        <button type='button' onClick={() => setShowBanner(false)}>
                            Remind Me Later
                        </button>

                        <Link href={`/trips/${tripId}/details`} className='font-bold'>
                            Get Trip Ready
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
