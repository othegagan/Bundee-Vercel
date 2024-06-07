'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function BackButton() {
    const rouer = useRouter();
    return (
        <Button onClick={() => rouer.back()} variant='link' className='group pl-0 text-sm font-semibold text-black hover:underline'>
            <ArrowLeftIcon className=' size-4 transition-all ease-in-out group-hover:-translate-x-2    ' />
            Back
        </Button>
    );
}
