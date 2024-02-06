'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import TripsDetails from './tripcard';
import ChatComponent from './conversation';
import { getTripDetailsbyId } from '@/app/_actions/trip_details_by_id';
import { VehiclesDetailsSkeleton } from '@/components/skeletons/skeletons';
import ErrorComponent from '@/components/custom/ErrorComponent';

export default function SingleVehicleDetails() {
    const [tabSelectedIndex, setTabSelectedIndex] = useState(0);
    const [masterTripData, setMasterTripData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchTripDetails = useCallback(async () => {
        try {
            setLoading(true);
            const authToken = localStorage.getItem('auth_token_login');
            const pathSegments = window.location.pathname.split('/');
            const tripId = pathSegments[pathSegments.length - 1];

            const data = await getTripDetailsbyId(authToken, tripId);
            if (data) {
                setMasterTripData(data);
            } else {
                throw new Error('No data received');
            }
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tabSelectedIndex === 0) {
            fetchTripDetails();
        }
    }, [tabSelectedIndex, fetchTripDetails]);

    const renderTabContent = () => {
        if (tabSelectedIndex === 0) {
            return !loading && (!error ? <TripsDetails tripsData={masterTripData} /> : <ErrorComponent />);
        } else if (tabSelectedIndex === 1) {
            return !loading && (!error ? <ChatComponent tripsData={masterTripData}  /> : <ErrorComponent />);
        }
    };

    return (
        <div className='bg-white'>
            <div className='pt-2'>
                <div className='mx-auto mt-6 max-w-2xl sm:px-6 lg:max-w-7xl lg:px-8'>
                    <div className='w-full lg:min-w-[80rem] border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between'>
                        <div className='flex flex-col gap-1'>
                            <h3 className='text-2xl font-bold leading-6 text-gray-900 ml-2'>Trips</h3>
                            <div role='tablist' aria-orientation='horizontal' className='h-14 items-center justify-center rounded-lg bg-neutral-100 mt-4 p-1 text-muted-foreground grid w-full grid-cols-2 max-w-lg gap-4 px-3' data-orientation='horizontal'>
                                <button
                                    onClick={() => setTabSelectedIndex(0)}
                                    type='button'
                                    role='tab'
                                    aria-controls='radix-:rb:-content-account'
                                    data-state={tabSelectedIndex === 0 ? 'active' : 'inactive'}
                                    id='radix-:rb:-trigger-account'
                                    className='inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow'
                                    data-orientation='horizontal'
                                    data-radix-collection-item=''>
                                    Trip Details
                                </button>
                                <button
                                    onClick={() => setTabSelectedIndex(1)}
                                    type='button'
                                    role='tab'
                                    aria-controls='radix-:rb:-content-password'
                                    data-state={tabSelectedIndex === 1 ? 'active' : 'inactive'}
                                    id='radix-:rb:-trigger-password'
                                    className='inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow'
                                    data-orientation='horizontal'
                                    data-radix-collection-item=''>
                                    Conversation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {loading && (
                    <div>
                        <VehiclesDetailsSkeleton />
                    </div>
                )}
                <div className='test'>{renderTabContent()}</div>
            </div>
        </div>
    );
}
