import Footer from '@/components/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import './globals.css';

import ClientOnly from '@/components/ClientOnly';
import { HideComponentInFrame, HideInIFrame } from '@/components/custom/HideWrapper';
import DrivingLicenceDialog from '@/components/dialogs/DrivingLicenceDialog';
import ForgotPasswordDialg from '@/components/dialogs/ForgotPasswordDialog';
import LoginDialog from '@/components/dialogs/LoginDialog';
import PhoneNumberSignInDialog from '@/components/dialogs/PhoneNumberSignInDialog';
import PhoneNumberVerificationDialog from '@/components/dialogs/PhoneNumberVerificationDialog';
import RegisterModal from '@/components/dialogs/RegisterDialog';
import TripReviewDialog from '@/components/dialogs/TripReviewDialog';
import Navbar from '@/components/navigation/Navbar';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/lib/providers';
import CarFilters from './vehicles/CarFilters';

const DocumentModal = dynamic(() => import('@/components/dialogs/DocumentDialog'), { ssr: false });

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
    title: 'MyBundee',
    description:
        'Step into the world of MyBundee, where you can discover a diverse range of vehicles tailored to your interests. Embark on a journey to explore and experience your dream destinations .'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' suppressHydrationWarning={true}>
            <head>
                <title>MyBundee</title>
                <link rel='icon' type='image/png' href='/bundee-logo.png' />
                <meta content='width=device-width, initial-scale=1' name='viewport' />
                <meta name='description' content='' />
                <link href='https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css' rel='stylesheet' />
            </head>
            <body className={`${inter.className} flex min-h-screen  w-full flex-col`}>
                <Providers>
                    <ClientOnly>
                        <LoginDialog />
                        <RegisterModal />
                        <PhoneNumberVerificationDialog />
                        <PhoneNumberSignInDialog />
                        <TripReviewDialog />
                        <CarFilters />
                        <DocumentModal />
                        <ForgotPasswordDialg />
                        <DrivingLicenceDialog />
                    </ClientOnly>
                    <HideComponentInFrame>
                        <Navbar />
                    </HideComponentInFrame>

                    {children}
                    <Toaster />
                    <div className='mt-auto'>
                        <HideInIFrame>
                            <Footer />
                        </HideInIFrame>
                    </div>
                </Providers>
                <SpeedInsights />
            </body>
        </html>
    );
}
