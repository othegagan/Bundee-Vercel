import { getTripDetailsbyId } from '@/server/tripOperations';
import { useEffect, useState } from 'react';
import useTabFocusEffect from './useTabFocusEffect';

export const useTripDetails = tripId => {
    const [tripData, setTripData] = useState(null);
    const [tripRating, setTripRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(false);

        try {
            const response = await getTripDetailsbyId(tripId);

            if (response.success && response.data.activetripresponse) {
                setTripData(response.data.activetripresponse[0]);
                setTripRating(response.data.tripreview)
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
    }, [tripId]);

    useTabFocusEffect(() => fetchData(), []);

    return { tripData, loading, error, tripRating };
};
