'use client';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton({ link }: { link?: string }) {
    const router = useRouter();
    return (
        <div className='w-fit'>
            <button
                type='button'
                role='link'
                onClick={() => (link ? router.push(link) : router.back())}
                className='`w-fit after:ease-&lsqb;cubic-bezier(0.65_0.05_0.36_1)&rsqb;` group relative flex items-center gap-1 after:absolute after:bottom-0 after:left-0 after:h-[1.2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-neutral-800 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100'>
                <ArrowLeftIcon className=' size-4 transition-all ease-in-out group-hover:-translate-x-1' /> Back
            </button>
        </div>
    );
}
