import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Providers from '@/lib/providers';
import { Toaster } from 'sonner';

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
            </head>
            <body className={`${inter.className} flex min-h-screen w-full flex-col`}>
                <Providers>
                    {children}
                    <Toaster position='bottom-right' closeButton={true} duration={4000} richColors className={`${inter.className}`} />
                </Providers>
            </body>
        </html>
    );
}
