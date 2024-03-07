'use client';
import { useEffect } from 'react';

const useTabFocusEffect = (callback, dependencies) => {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                callback();
            }
        };

        callback();

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, dependencies);
};

export default useTabFocusEffect;
