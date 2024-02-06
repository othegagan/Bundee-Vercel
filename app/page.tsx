'use client';

import HeroSeaction from '@/components/HeroSeaction';
import Available_Locations from '@/components/landing_page/Available_Locations';
import Banner from '@/components/landing_page/Banner';
import FAQ from '@/components/landing_page/FAQ';
import BundeeBranding from '@/components/landing_page/barnding';
import RecentlyViewedComponents from '@/components/landing_page/recentlyviewed_vehicles';
import { useEffect, useState } from 'react';
import { initializeAuthTokens } from './_actions/initilize_auth_token';

const LandingPage = () => {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await initializeAuthTokens();
                localStorage.setItem('bundee_auth_token', response.token);
            } catch (error) {
                console.error('Error initializing tokens:', error);
            }
        };
        fetchTokens();
        const user = localStorage.getItem('session_user');
        if (user) {
            setUserLoggedIn(true);
        } else {
            setUserLoggedIn(false);
        }
    }, []);

    return (
        <>
            <HeroSeaction />
            <Available_Locations />
            {userLoggedIn ? <RecentlyViewedComponents /> : null}
            <Banner />
            <BundeeBranding />
            <FAQ />
        </>
    );
};

export default LandingPage;
