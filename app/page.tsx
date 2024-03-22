import {HideInIFrame} from '@/components/HideInIFrame';
import Available_Locations from '@/components/landing_page/Available_Locations';
import Banner from '@/components/landing_page/Banner';
import BundeeBranding from '@/components/landing_page/BundeeBranding';
import FAQ from '@/components/landing_page/FAQ';
import HeroSeaction from '@/components/landing_page/HeroSeaction';
import RecentlyViewedVehicles from '@/components/landing_page/RecentlyViewedVehicles';
import { getSession } from '@/lib/auth';

export default async function Page() {
    const session = await getSession();
    return (
        <>
            <HeroSeaction />

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
