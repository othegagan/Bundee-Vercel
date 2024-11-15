import { HideInIFrame } from '@/components/custom/HideWrapper';
import Available_Locations from '@/components/landing_page/Available_Locations';
import Banner from '@/components/landing_page/Banner';
import BundeeBranding from '@/components/landing_page/BundeeBranding';
import FAQ from '@/components/landing_page/FAQ';
import HeroSection from '@/components/landing_page/HeroSection';
import PushNotifications from '@/components/landing_page/PushNotifications';
import RecentlyViewedVehicles from '@/components/landing_page/RecentlyViewedVehicles';
import TripReadinessBanner from '@/components/landing_page/TripReadinessBanner';
import UpcomingAndOngiongTrips from '@/components/landing_page/UpcomingAndOngoingTrips';
import { getSession } from '@/lib/auth';

export default async function Page() {
    const session = await getSession();
    return (
        <>
            {session.isLoggedIn && <TripReadinessBanner />}

            <HeroSection />

            {session.isLoggedIn && <PushNotifications />}

            <HideInIFrame>
                <UpcomingAndOngiongTrips />
                <Available_Locations />
                {session.isLoggedIn && <RecentlyViewedVehicles />}
                <Banner />
                <BundeeBranding />
                <FAQ />
            </HideInIFrame>
        </>
    );
}
