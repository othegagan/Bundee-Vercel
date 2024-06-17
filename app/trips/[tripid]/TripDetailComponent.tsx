'use client';

import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { VehiclesDetailsSkeleton } from '@/components/skeletons/skeletons';
import { useTripDetails } from '@/hooks/useTripDetails';
import { useEffect, useState } from 'react';
import ChatComponent from './components/ChatComponent';
import Details from './components/Details';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import BackButton from '@/components/BackButton';

const TripDetailComponent = () => {
    const [tabSelectedIndex, setTabSelectedIndex] = useState(0);
    const { tripData, loading, error, tripRating } = useTripDetails();

    // useScrollToTopOnLoad(loading);

    return (
        <BoxContainer className='mb-6 py-1'>
            <div className='flex flex-col gap-1 border-b pb-2 md:flex-row md:items-center md:justify-between'>
                {/* <h3 className='ml-2 text-2xl font-bold leading-6 text-gray-900'>Trip Details</h3> */}
                <BackButton link='/trips' />
                <div
                    role='tablist'
                    aria-orientation='horizontal'
                    className='mt-4 grid h-14 w-full max-w-lg grid-cols-2 items-center justify-center gap-4 rounded-lg bg-neutral-100 p-1 px-3 text-muted-foreground'
                    data-orientation='horizontal'>
                    {['Trip Details', 'Conversation'].map((title, index) => (
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

            {loading ? (
                <VehiclesDetailsSkeleton />
            ) : (
                <MainTripDetails tripData={tripData} tripRating={tripRating} tabSelectedIndex={tabSelectedIndex} error={error} />
            )}
        </BoxContainer>
    );
};

export default TripDetailComponent;

const MainTripDetails = ({ tripData, tabSelectedIndex, error, tripRating }) => {
    if (error) {
        return <ErrorComponent />;
    }

    return (
        <>
            {tabSelectedIndex === 0 && tripData && <Details tripsData={tripData} tripRating={tripRating} />}
            {tabSelectedIndex === 1 && <ChatComponent tripsData={tripData} />}
        </>
    );
};
