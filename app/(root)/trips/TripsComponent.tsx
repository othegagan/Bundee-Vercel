'use client';

import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { TripsCardsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import { cn, formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import { getTrips } from '@/server/tripOperations';
import { CalendarDays, MapPin } from 'lucide-react';
import { useQueryState } from 'next-usequerystate';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

const tabs = [
    { id: 0, tab: 'active', title: 'Trips' },
    { id: 1, tab: 'past', title: 'Past Trips' }
];

const useTripsData = (tabSelectedIndex: string) => {
    const [tripsResponse, setTripsResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setLoading(true);
                const response = await getTrips(tabSelectedIndex === 'active' ? 'useridbookings' : 'useridhistory');
                setTripsResponse(response);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [tabSelectedIndex]); // Re-fetch when tabSelectedIndex changes

    useScrollToTopOnLoad(loading); // Keep this for scrolling to top on load

    const hasTrips = tripsResponse?.success && tripsResponse?.data?.activetripresponse?.length > 0;
    const noTrips = tripsResponse?.success && tripsResponse?.data?.activetripresponse?.length === 0;

    return { tripsResponse, loading, error, hasTrips, noTrips };
};

const TripsComponent = () => {
    const [tabSelectedIndex, setTabSelectedIndex] = useQueryState('', { defaultValue: 'active', history: 'replace' });

    const { tripsResponse, loading, error, hasTrips, noTrips } = useTripsData(tabSelectedIndex);

    useScrollToTopOnLoad(loading);

    return (
        <BoxContainer className='mb-6'>
            <div className='mx-auto flex select-none flex-col gap-1 border-b md:flex-row md:items-center md:justify-center'>
                <div
                    aria-orientation='horizontal'
                    className='mx-auto mt-4 grid w-fit max-w-lg grid-cols-2 items-center justify-center gap-10 rounded-lg text-muted-foreground'
                    data-orientation='horizontal'>
                    {tabs.map(({ id, title, tab }) => (
                        <button
                            key={id}
                            onClick={() => setTabSelectedIndex(tab)}
                            type='button'
                            role='tab'
                            className={cn(
                                'inline-flex items-center justify-center whitespace-nowrap px-3 py-2 font-medium text-md ring-offset-background transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                tabSelectedIndex === tab ? 'font-bold text-lg text-primary' : 'font-medium text-muted-foreground'
                            )}>
                            {title}
                        </button>
                    ))}
                </div>
            </div>

            <div className='mx-auto mt-6 grid w-full max-w-4xl grid-cols-1'>
                {loading && <TripsCardsSkeleton />}
                {!loading && error && <ErrorComponent message='Something went wrong in getting trips' />}
                {!loading && !error && noTrips && <ErrorComponent message='No trips found.' />}
                {!loading && !error && hasTrips && tripsResponse.data.activetripresponse.map((trip: any) => <TripCard key={trip.tripid} trip={trip} />)}
            </div>
        </BoxContainer>
    );
};

function TripCard({ trip }: { trip: any }) {
    const router = useRouter();
    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });
    return (
        <Link
            key={trip.tripid}
            href={`/trips/${trip.tripid}/details`}
            className={cn(
                'flex gap-2 border-b p-1 hover:cursor-pointer hover:rounded-md hover:bg-neutral-100 md:p-2',
                isTabletOrLarger && 'flex w-full flex-1 gap-4 md:py-3'
            )}>
            <div className={cn('flex-center overflow-hidden rounded-md', isTabletOrLarger ? 'h-28 w-44' : 'size-28 h-16')}>
                <img
                    src={trip.vehicleImages[0]?.imagename || '/images/image_not_available.png'}
                    alt={`${trip.vehmake} ${trip.vehmodel}`}
                    className='h-full w-full object-cover object-center'
                />
            </div>

            <div className={cn('flex flex-1 flex-col gap-2', isTabletOrLarger && 'w-full')}>
                <div className={cn('flex items-center justify-between', isTabletOrLarger && 'w-full')}>
                    <div className={cn('truncate font-semibold text-16 md:max-w-sm', isTabletOrLarger && 'max-w-[200px] font-bold text-[18px]')}>
                        {toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}
                        <div className='font-medium text-14 text-muted-foreground'>{trip?.vehicleNumber}</div>
                    </div>
                    <div className={cn('flex-center justify-between gap-2', isTabletOrLarger && 'mt-2 gap-6')}>
                        <StatusBadge status={trip.status} type='trip' />
                        {trip.swapDetails && trip.swapDetails.length > 0 && <StatusBadge status={trip.swapDetails[0].statuscode} type='swap' />}
                    </div>
                </div>

                {isTabletOrLarger && (
                    <div className='flex w-full items-center gap-2'>
                        <CalendarDays className='size-4 ' />
                        <div className='text-14 '>
                            {formatDateAndTime(trip.starttime, trip?.vehzipcode, 'ddd, MMM DD YYYY')} -{' '}
                            {formatDateAndTime(trip.endtime, trip?.vehzipcode, 'ddd, MMM DD YYYY')}
                        </div>
                    </div>
                )}

                <div className={cn('flex items-center gap-2 text-14', isTabletOrLarger && 'flex-center justify-start')}>
                    <MapPin className={cn('size-5 text-muted-foreground', isTabletOrLarger && 'size-4')} />
                    <p className={cn('truncate', isTabletOrLarger ? 'max-w-[300px] md:max-w-[400px]' : 'max-w-[300px]')}>
                        {getFullAddress({ tripDetails: trip })}
                    </p>
                </div>

                <div className={cn('flex items-center justify-between', isTabletOrLarger && '-mt-6 justify-end gap-10 pl-1.5')}>
                    <Button
                        onClick={() => router.push(`/trips/${trip.tripid}/details${isTabletOrLarger ? '' : '?messages=true'}`)}
                        variant='link'
                        className='flex items-center gap-2 px-0 font-semibold text-secondary-foreground'>
                        <img src='/icons/chat.svg' alt='chat' width={18} height={18} />
                        Message Host
                    </Button>
                </div>
            </div>
        </Link>
    );
}

export default TripsComponent;
export const StatusBadge = ({ status, type, className }: { type: 'trip' | 'swap'; status: string; className?: string }) => {
    if (!status) return null;
    const statusTexts: any = {
        swap: {
            swappr: 'Swap Proposal Requested',
            swaprej: 'Swap Proposal Rejected',
            swapacc: 'Swap Proposal Approved',
            default: 'Unknown Status'
        }
    };

    const getStatusText = (type: string, status: string) => {
        return statusTexts[type]?.[status.toLowerCase()] || status;
    };

    const statusText = getStatusText(type, status);

    return (
        <div className={cn('inline-flex w-fit items-center whitespace-nowrap bg-[#0A4AC61A] px-2.5 py-1.5 font-bold text-12 capitalize', className)}>
            {statusText}
        </div>
    );
};
