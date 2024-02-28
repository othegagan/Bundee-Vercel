'use client';

import { Button } from '@/components/ui/button';
import NoAuthStatePage from './noauth';
import { useEffect, useState } from 'react';
import { getAllActiveTripsByUser } from '../_actions/get_active_trips';
import { getAllHistoryTripsByUser } from '../_actions/get_all_history_trips';
import TripsList from './tripscard';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { useUserAuth } from '@/lib/authContext';

const UserTrips = () => {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [tabSelectedIndex, settabSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tripsResponse, setTripResponses] = useState({});
    const [error, setError] = useState(false);

    const {user} = useUserAuth();


    useEffect(() => {

        const fetchData = async () => {
            try {
                const authToken = localStorage.getItem('auth_token_login');
                const userId = localStorage.getItem('userId');

                if (tabSelectedIndex == 0) {
                    const data = await getAllActiveTripsByUser(userId, authToken);
                    if (data != null) {
                        setTripResponses(data);
                        // console.log(tripsResponse);
                    }
                }

                if (tabSelectedIndex == 1) {
                    const data = await getAllHistoryTripsByUser(userId, authToken);
                    if (data != null) {
                        setTripResponses(data);
                        // console.log(tripsResponse);
                    }
                }
                setTimeout(() => {
                    setLoading(false); // Set loading to false when data is loaded
                }, 2000);
            } catch (error) {
                setError(true);
                console.error('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tabSelectedIndex]);

    if (!user) {
        return <NoAuthStatePage />;
    }

    return (
        <>
            <div className='container mx-auto px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8 sm:py-6 min-h-[90vh]'>
                <div className='w-full lg:min-w-[76rem] border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between'>
                    <div className='flex flex-col gap-1'>
                        <h3 className='text-2xl font-bold leading-6 text-gray-900 ml-2'>Trips</h3>
                        <div
                            role='tablist'
                            aria-orientation='horizontal'
                            className='h-14 items-center justify-center rounded-lg bg-neutral-100 mt-4 p-1 text-muted-foreground grid w-full grid-cols-2 max-w-lg gap-4 px-3'
                            data-orientation='horizontal'>
                            <button
                                onClick={() => settabSelectedIndex(0)}
                                type='button'
                                role='tab'
                                aria-controls='radix-:rb:-content-account'
                                data-state={tabSelectedIndex === 0 ? 'active' : 'inactive'}
                                id='radix-:rb:-trigger-account'
                                className='inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow'
                                data-orientation='horizontal'
                                data-radix-collection-item=''>
                                Current Bookings
                            </button>
                            <button
                                onClick={() => settabSelectedIndex(1)}
                                type='button'
                                role='tab'
                                aria-controls='radix-:rb:-content-password'
                                data-state={tabSelectedIndex === 1 ? 'active' : 'inactive'}
                                id='radix-:rb:-trigger-password'
                                className='inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow'
                                data-orientation='horizontal'
                                data-radix-collection-item=''>
                                Booking History
                            </button>
                        </div>
                    </div>
                </div>

                <div className='w-full'>
                    {loading ? (
                        <VehiclesCardsSkeleton />
                    ) : tabSelectedIndex === 0 ? (
                        <div className='mt-6 '>{error ? <ErrorComponent /> : <TripsList tripsData={tripsResponse} />}</div>
                    ) : (
                        tabSelectedIndex === 1 && <div className='mt-6 '>{error ? <ErrorComponent /> : <TripsList tripsData={tripsResponse} />}</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserTrips;
