'use client';
import useHashIdLocalStorage from '@/hooks/useHashIdLocalStorage';
import { LogoIcon } from '@/public/icons';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface LogoPros {
    className?: string;
}

const Logo = ({ className }: LogoPros) => {
    const router = useRouter();

    const handleLogoClick = useCallback(() => {
        router.push('/');
    }, []);

    const [isInIframe, setIsInIframe] = useState(false);
    useHashIdLocalStorage('hostid');

    useEffect(() => {
        const inIframe = window !== window.top;
        setIsInIframe(inIframe);
    }, []);

    return isInIframe ? (
        <img src='https://urusreps.com/wp-content/uploads/2024/02/IMG_5755.jpg' className='h-10 w-20' alt='host_logo' />
    ) : (
        <>
            <button type='button' onClick={handleLogoClick} className={className}>
                <LogoIcon />
            </button>
        </>
    );
};

export default Logo;
