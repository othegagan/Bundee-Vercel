'use client';
import React, { useEffect, useState } from 'react';
import TripsList from './TripsList';
import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsCardsSkeleton } from '@/components/skeletons/skeletons';
import useTabFocusEffect from '@/hooks/useTabFocusEffect';
import { getTrips } from '@/server/tripOperations';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';

const UserTrips = () => {
    const [tabSelectedIndex, setTabSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tripsResponse, setTripsResponse] = useState({});
    const [error, setError] = useState(false);

    const fetchData = async tabIndex => {
        try {
            setLoading(true);
            setError(false);
            const endpoint = tabIndex === 0 ? 'useridbookings' : 'useridhistory';
            const response = await getTrips(endpoint);

            if (response.success) {
                const data = response.data.activetripresponse;
                setTripsResponse(data || []);
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
        fetchData(tabSelectedIndex);
    }, [tabSelectedIndex]);

    useScrollToTopOnLoad(loading);

    useTabFocusEffect(() => fetchData(tabSelectedIndex), []);

    return (
        <BoxContainer className='mb-6 py-6'>
            <div className='flex flex-col gap-1 border-b pb-2 md:flex-row md:items-center md:justify-between'>
                <h3 className='ml-2 text-2xl font-bold leading-6 text-gray-900'>Trips</h3>
                <div
                    role='tablist'
                    aria-orientation='horizontal'
                    className='mt-4 grid h-14 w-full max-w-lg grid-cols-2 items-center justify-center gap-4 rounded-lg bg-neutral-100 p-1 px-3 text-muted-foreground'
                    data-orientation='horizontal'>
                    {['Current Bookings', 'Booking History'].map((title, index) => (
                        <button
                            key={index}
                            onClick={() => setTabSelectedIndex(index)}
                            type='button'
                            role='tab'
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                            ${tabSelectedIndex === index ? 'bg-primary text-white shadow' : 'bg-neutral-100 text-muted-foreground'}`}>
                            {title}
                        </button>
                    ))}
                </div>
            </div>

            <div className='mt-6 w-full'>
                {loading ? <TripsCardsSkeleton /> : <div className='mt-6'>{error ? <ErrorComponent /> : <TripsList tripsData={tripsResponse} />}</div>}
            </div>
        </BoxContainer>
    );
};

export default UserTrips;
