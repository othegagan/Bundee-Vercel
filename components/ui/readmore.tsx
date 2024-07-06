import { cn } from '@/lib/utils';
import { Inter, Poppins } from 'next/font/google';
import React, { useState } from 'react';
import { Button } from './button';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export default function Readmore({ text }: { text: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    const shouldShowReadMore = text.length > 400;

    return (
        <div className=' '>
            <pre className={cn(`text-15 text-wrap font-sans ${inter.className}`, { 'line-clamp-6 md:line-clamp-5': !isExpanded })}>{text.trim()}</pre>
            {shouldShowReadMore && (
                <Button variant='outline' size='sm' onClick={toggleReadMore} className='mt-3'>
                    {isExpanded ? 'Read Less' : 'Read More'}
                </Button>
            )}
        </div>
    );
}
