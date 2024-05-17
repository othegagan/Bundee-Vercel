import { getTripDetailsbyId } from '@/server/tripOperations';
import { useEffect, useState } from 'react';
import useTabFocusEffect from './useTabFocusEffect';

export const useTripDetails = () => {
    const [tripData, setTripData] = useState(null);
    const [tripRating, setTripRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(false);

        try {
            const tripId = window.location.pathname.split('/')[2];
            const response = await getTripDetailsbyId(Number(tripId));

            if (response.success && response.data.activetripresponse) {
                setTripData(response.data.activetripresponse[0]);
                setTripRating(response.data.tripreview);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching data', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useTabFocusEffect(() => fetchData(), []);

    return { tripData, loading, error, tripRating };
};
