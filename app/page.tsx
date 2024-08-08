import { HideInIFrame } from '@/components/custom/HideWrapper';
import Available_Locations from '@/components/landing_page/Available_Locations';
import Banner from '@/components/landing_page/Banner';
import BundeeBranding from '@/components/landing_page/BundeeBranding';
import FAQ from '@/components/landing_page/FAQ';
import HeroSection from '@/components/landing_page/HeroSection';
import PushNotifications from '@/components/landing_page/PushNotifications';
import RecentlyViewedVehicles from '@/components/landing_page/RecentlyViewedVehicles';
import { getSession } from '@/lib/auth';

export default async function Page() {
    const session = await getSession();
    return (
        <>
            <HeroSection />
            {session.isLoggedIn && <PushNotifications />}

            <HideInIFrame>
                <Available_Locations />
                {session.isLoggedIn && <RecentlyViewedVehicles />}
                <Banner />
                <BundeeBranding />
                <FAQ />
            </HideInIFrame>
        </>
    );
}
