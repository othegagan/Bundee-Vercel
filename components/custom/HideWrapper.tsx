'use client';
import { hideInRouter } from '@/constants';
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

export function HideComponent({ children, hideOnlyInRouter }: { children: React.ReactNode; hideOnlyInRouter?: string }) {
    const pathname = usePathname();

    function shouldHide(pathname: string | string[]) {
        if (hideOnlyInRouter) {
            const exactMatch = pathname === hideOnlyInRouter;
            const partialMatch = pathname.includes(hideOnlyInRouter);
            return exactMatch || partialMatch;
        }

        return hideInRouter.some((route) => (route.matches ? pathname === route.path : pathname.includes(route.path)));
    }

    if (shouldHide(pathname)) {
        return null;
    }

    return children;
}
