import { useEffect } from 'react';

const useScrollToTopOnLoad = (loading: boolean) => {
    useEffect(() => {
        if (loading) {
            window.scrollTo(0, 0); // Scroll to top
        }
    }, [loading]);
};

export default useScrollToTopOnLoad;
