'use client';

import { getSession } from '@/lib/auth';
import { getDriverSpecificTripOnDashboard } from '@/server/tripOperations';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Container from '../BoxContainer';

export default function TripReadinessBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [tripId, setTripId] = useState(null);

    useEffect(() => {
        async function checkForSessionAndTripReadiness() {
            const session = await getSession();

            if (!session?.isLoggedIn || !session?.userId) return;

            const response = await getDriverSpecificTripOnDashboard();

            if (!response?.success) return;

            const upcomingTrips = response.data?.driverUpcomingTripsResponses || [];

            // Check readiness for the first trip in the list
            if (upcomingTrips.length > 0) {
                const firstTrip = upcomingTrips[0];
                const needsReadiness =
                    !firstTrip.isLicenseVerified ||
                    // !firstTrip.isInsuranceVerified ||
                    firstTrip.isLicenseExpired ||
                    // firstTrip.isInsuranceExpired ||
                    !firstTrip.isMobileVerified ||
                    !firstTrip.isRentalAgreementAccepted;

                if (needsReadiness) {
                    setTripId(firstTrip.tripId);
                    setShowBanner(true);
                }
            }
        }

        checkForSessionAndTripReadiness();
    }, []);

    if (!showBanner || !tripId) return null;

    return (
        <div className='absolute top-[4.5rem] z-[2] w-full bg-orange-100 py-2'>
            <Container className='w-full'>
                <div className='flex flex-wrap items-center justify-between gap-4 text-nowrap text-sm'>
                    <p className='text-wrap font-medium'>Complete the readiness checklist before your trip.</p>

                    <div className='ml-auto flex items-center gap-3 md:gap-6'>
                        <button type='button' onClick={() => setShowBanner(false)}>
                            Remind Me Later
                        </button>

                        <Link href={`/trips/${tripId}/details`} className='font-bold'>
                            Get Trip Ready
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
