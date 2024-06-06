import { fetchDataFromMapboxWithForwardGeocoding } from '@/server/mapbox';
import { useState } from 'react';

export const useMapboxData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const response: any = await fetchDataFromMapboxWithForwardGeocoding(query);
            setData(response || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Something went wrong! Try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdreeses = async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const response: any = await fetchDataFromMapboxWithForwardGeocoding(query, true);
            setData(response || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Something went wrong! Try again later.');
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, fetchData, fetchAdreeses };
};
