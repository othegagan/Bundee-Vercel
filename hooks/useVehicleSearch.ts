'use client';

import { getSession } from '@/lib/auth';
import { getSearchDates } from '@/lib/utils';
import { searchVehiclesByLatitudeAndLongitude } from '@/server/vehicleOperations';
import { addDays, format } from 'date-fns';
import { useState } from 'react';
import useCarFilterDialog from './dialogHooks/useCarFilterDialog';

export function getAllURLParameters() {
    const url = new URL(window.location.href);
    const params: any = new URLSearchParams(url.search);
    const queryParams = {};
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }

    return queryParams;
}

const useVehicleSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewChanged, setViewChanged] = useState(false);
    const useCarFilter = useCarFilterDialog();
    const searchVehicles = async () => {
        setLoading(true);
        useCarFilter.setIsLoading(true);
        setError(null);
        setData([]);
        setSearchQuery('');

        try {
            const hostid = localStorage.getItem('hostid');
            const session = await getSession();
            const searchParams: any = getAllURLParameters();

            const city = searchParams?.city ? searchParams?.city : 'Austin, Texas, United States';
            const latitude = searchParams?.latitude ? searchParams?.latitude : '-97.7437';
            const longitude = searchParams?.longitude ? searchParams?.longitude : '30.271129';
            const startDate = searchParams?.startDate ? searchParams?.startDate : format(new Date(), 'yyyy-MM-dd');
            const endDate = searchParams?.endDate ? searchParams?.endDate : format(addDays(new Date(), 3), 'yyyy-MM-dd');
            const startTime = searchParams?.startTime ? searchParams?.startTime : '10:00:00';
            const endTime = searchParams?.endTime ? searchParams?.endTime : '10:00:00';
            const isAirport = searchParams?.isAirport ? searchParams?.isAirport : false;
            const southWestlat = searchParams?.southWestlat ? searchParams?.southWestlat : '';
            const southWestlong = searchParams?.southWestlong ? searchParams?.southWestlong : '';
            const northEastlat = searchParams?.northEastlat ? searchParams?.northEastlat : '';
            const northEastlong = searchParams?.northEastlong ? searchParams?.northEastlong : '';
            const isMapSearch = searchParams?.isMapSearch ? searchParams?.isMapSearch : false;

            const searchPayload = {
                lat: longitude,
                lng: latitude,
                startTs: getSearchDates(longitude, latitude, startDate, startTime),
                endTS: getSearchDates(longitude, latitude, endDate, endTime),
                pickupTime: startTime,
                dropTime: endTime,
                isAirport,
                isMapSearch,
                userId: session.userId || '',
                hostId: Number(hostid) || 0,
            };

            const mapsearchPayload = {
                southWestlat: southWestlat,
                southWestlong: southWestlong,
                nothEastlat: northEastlat,
                northEastlong: northEastlong,
                startTs: getSearchDates(northEastlat, northEastlong, startDate, startTime),
                endTS: getSearchDates(northEastlat, northEastlong, endDate, endTime),
                pickupTime: startTime,
                dropTime: endTime,
                isAirport,
                userId: session.userId || '',
                hostId: Number(hostid) || 0,
                isMapSearch: isMapSearch,
            };

            const payload = isMapSearch === 'true' ? mapsearchPayload : searchPayload;

            const response = await searchVehiclesByLatitudeAndLongitude(payload);
            if (response.success) {
                const data = response.data.vehicleAllDetails;
                setData(data);
                useCarFilter.setCarDetails(data);
                const newSearchQuery = `city=${city}&latitude=${latitude}&longitude=${longitude}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}&isAirport=${isAirport}`;
                setSearchQuery(newSearchQuery);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.log(error);
            setError(error);
        } finally {
            setLoading(false);
            useCarFilter.setIsLoading(false);
            setViewChanged(false);
        }
    };

    // useTabFocusEffect(searchVehicles, []);

    return { loading, error, data, searchQuery, searchVehicles, viewChanged, setViewChanged };
};

export default useVehicleSearch;
