import { StatusBadge } from '@/app/(root)/trips/TripsComponent';
import { getSession } from '@/lib/auth';
import { formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import { getDriverSpecificTripOnDashboard } from '@/server/tripOperations';
import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import BoxContainer from '../BoxContainer';

export default async function UpcomingAndOngiongTrips() {
    const session = await getSession();

    if (!session.isLoggedIn && !session.userId) return null;

    const response = await getDriverSpecificTripOnDashboard();

    if (!response) return null;

    if (!response.success) return null;

    const upcomingTrips = response.data?.driverUpcomingTripsResponses || [];
    const ongoingTrips = response.data?.driverOnGoingTripResponse || [];

    return (
        <BoxContainer className='space-y-2'>
            <YourTrips upcomingTrips={upcomingTrips} ongoingTrips={ongoingTrips} />
        </BoxContainer>
    );
}

function YourTrips({ upcomingTrips, ongoingTrips }: { upcomingTrips: any[]; ongoingTrips: any[] }) {
    if (!upcomingTrips.length && !ongoingTrips.length) return null;
    return (
        <div className='space-y-3 py-4'>
            <h3>Your Trips</h3>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-4'>
                {ongoingTrips?.slice(0, 1).map((trip: any) => (
                    <TripCard key={trip.tripId} trip={trip} />
                ))}
                {upcomingTrips?.slice(0, 2).map((trip: any) => (
                    <TripCard key={trip.tripId} trip={trip} />
                ))}
            </div>
        </div>
    );
}

function TripCard({ trip }: { trip: any }) {
    return (
        <Link className='group relative cursor-pointer rounded-md bg-white shadow ' href={`/trips/${trip.tripId}/details`}>
            <div className='aspect-video w-full overflow-hidden rounded-md bg-neutral-200 group-hover:opacity-75 lg:aspect-video lg:h-44'>
                <img
                    src={trip?.vehicleImage || '/images/image_not_available.png'}
                    alt={trip?.vehicleImage}
                    className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-110 lg:h-full lg:w-full'
                />
            </div>

            <div className=' flex flex-col gap-2 p-2'>
                <div className='max-w-[200px] truncate font-bold text-[18px] md:max-w-sm'>{toTitleCase(`${trip.make} ${trip.model} ${trip.year}`)}</div>
                <div className='flex justify-between gap-4'>
                    <div className='font-medium text-14 text-muted-foreground '>{trip?.vehicleNumber}</div>
                    <StatusBadge status={trip.status} type='trip' />
                </div>
                <div className='flex w-full items-center gap-2'>
                    <CalendarDays className='size-5 text-muted-foreground' />
                    <div className='text-14 '>
                        {formatDateAndTime(trip.startTime, trip?.zipCode, ' MMM DD YYYY')} - {formatDateAndTime(trip.endTime, trip?.zipCode, ' MMM DD YYYY')}
                    </div>
                </div>

                <div className='mt-1.5 flex-center justify-start gap-2 text-14'>
                    <MapPin className='size-5 text-muted-foreground' />
                    <p className=' max-w-[300px] truncate'>{getFullAddress({ vehicleDetails: trip })}</p>
                </div>
            </div>
        </Link>
    );
}
