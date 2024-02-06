import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Head from './head';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/lib/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'MyBundee',
    description: '',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <Providers>
                <Head />
                <body className={` ${inter.className} flex flex-col  w-full min-h-screen`}>
                    <Navbar />

                    {children}
                    <Toaster />
                    <Footer />
                </body>
            </Providers>
        </html>
    );
}
