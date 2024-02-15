'use client';

import { getVehicleAllDetails } from '@/app/_actions/saerch_available_vehicle';
import { addDays, format } from 'date-fns';
import { useState } from 'react';

const useVehicleSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const searchVehicles = async (searchParams, token) => {
        setLoading(true);
        setError(null);
        setData([]);
        setSearchQuery('');

        try {
            const city = searchParams?.city ? searchParams?.city : 'Austin, Texas, United States';
            const latitude = searchParams?.latitude ? searchParams?.latitude : '-97.7437';
            const longitude = searchParams?.longitude ? searchParams?.longitude : '30.271129';
            const startDate = searchParams?.startDate ? searchParams?.startDate : format(new Date(), 'yyyy-MM-dd');
            const endDate = searchParams?.endDate ? searchParams?.endDate : format(addDays(new Date(), 3), 'yyyy-MM-dd');
            const startTime = searchParams?.startTime ? searchParams?.startTime : '10:00:00';
            const endTime = searchParams?.endTime ? searchParams?.endTime : '10:00:00';
            const isAirport = searchParams?.isAirport ? searchParams?.isAirport : false;

            const userId = localStorage.getItem('userId');
            const searchPayload = {
                lat: longitude,
                lng: latitude,
                startTs: new Date(startDate + 'T' + startTime).toISOString(),
                endTS: new Date(endDate + 'T' + endTime).toISOString(),
                pickupTime: startTime,
                dropTime: endTime,
                isAirport,
                userId: userId || '',
            };

            console.log(searchPayload);
            const response = await getVehicleAllDetails(searchPayload, token);
            setData(response);

            const newSearchQuery = `city=${city}&latitude=${latitude}&longitude=${longitude}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}&isAirport=${isAirport}`;
            setSearchQuery(newSearchQuery);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, data, searchQuery, searchVehicles };
};

export default useVehicleSearch;
