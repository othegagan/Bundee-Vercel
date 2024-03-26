import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Footer from '@/components/Footer';

import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/navigation/Navbar';
import LoginModal from '@/components/modals/LoginModal';
import ClientOnly from '@/components/ClientOnly';
import RegisterModal from '@/components/modals/RegisterModal';
import PhoneNumberModal from '@/components/modals/PhoneNumberVerification';
import { HideComponentInFrame, HideInIFrame } from '@/components/HideInIFrame';
import PhoneNumberSignInModal from '@/components/modals/PhoneNumberSignInModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'MyBundee',
    description: 'Step into the world of Bundee, where you can discover a diverse range of vehicles tailored to your interests. Embark on a journey to explore and experience your dream destinations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' suppressHydrationWarning>
            <title>MyBundee</title>
            <link rel='icon' type='image/png' href='/bundee-logo.png'></link>
            <meta content='width=device-width, initial-scale=1' name='viewport' />
            <meta name='description' content='' />
            <body className={` ${inter.className} flex min-h-screen  w-full flex-col`}>
                <ClientOnly>
                    <LoginModal />
                    <RegisterModal />
                    <PhoneNumberModal />
                    <PhoneNumberSignInModal />
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
            </body>
        </html>
    );
}
