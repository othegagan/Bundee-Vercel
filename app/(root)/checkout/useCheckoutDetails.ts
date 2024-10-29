import { getSession } from '@/lib/auth';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';

export function useCheckoutDetails() {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const session = await getSession();

                const data = JSON.parse(secureLocalStorage.getItem('checkOutInfo') as any);

                if (data && session.isLoggedIn) {
                    setData(data);
                } else {
                    setError(true);
                    return;
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { data, loading, error };
}
