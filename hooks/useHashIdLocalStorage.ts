'use client';
import { useEffect } from 'react';
import { setCookie } from 'cookies-next';

const useHashIdLocalStorage = storageKey => {
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.includes(`#${storageKey}=`)) {
                const id = hash.split('=')[1];
                localStorage.setItem(storageKey, id);
                setCookie(storageKey, id);
            }
        };

        window.addEventListener('hashchange', handleHashChange);

        // Check for hash id when component mounts
        handleHashChange();

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [storageKey]);
};

export default useHashIdLocalStorage;
