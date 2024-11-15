import { getSession } from '@/lib/auth';
import { getDriverSpecificTripOnDashboard } from '@/server/tripOperations';
import { TripReadinessBannerClient } from './TripReadinessBannerClient';

export default async function TripReadinessBanner() {
    const session = await getSession();

    if (!session?.isLoggedIn || !session?.userId) {
        return null;
    }

    const response = await getDriverSpecificTripOnDashboard();

    if (!response?.success) {
        return null;
    }

    const upcomingTrips = response.data?.driverUpcomingTripsResponses || [];

    // Check readiness for the first trip in the list
    if (upcomingTrips.length > 0) {
        const firstTrip = upcomingTrips[0];
        const needsReadiness =
            !firstTrip.isLicenseVerified ||
            !firstTrip.isInsuranceVerified ||
            firstTrip.isLicenseExpired ||
            firstTrip.isInsuranceExpired ||
            !firstTrip.isMobileVerified ||
            !firstTrip.isRentalAgreementAccepted;

        if (needsReadiness) {
            return <TripReadinessBannerClient tripId={firstTrip.tripId} />;
        }
    }

    return null;
}
