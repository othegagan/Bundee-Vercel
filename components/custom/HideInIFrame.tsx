'use client';
import useHashIdLocalStorage from '@/hooks/useHashIdLocalStorage';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export function HideInIFrame({ children }: { children: React.ReactNode }) {
    const [isInIframe, setIsInIframe] = useState(false);
    useHashIdLocalStorage('hostid');

    useEffect(() => {
        const inIframe = window !== window.top;
        setIsInIframe(inIframe);
    }, []);

    return isInIframe ? null : <div>{children}</div>;
}

export function HideComponentInFrame({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (pathname === '/hostpage') {
        return null;
    }
    return children;
}
