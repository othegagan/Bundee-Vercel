import useLoginDialog from '@/hooks/dialogHooks/useLoginDialog';
import { getSession } from '@/lib/auth';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';

export function useCheckoutDetails() {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loginDialog = useLoginDialog();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const session = await getSession();
                if (!session.userId || !session.isLoggedIn) {
                    loginDialog.onOpen();
                }

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
