import BackButton from '@/components/BackButton';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { getSession } from '@/lib/auth';
import type React from 'react';
import TabsComponent from './_components/TabsComponent';

export default async function layout({ params, children }: { params: { bookingid: string }; children: React.ReactNode }) {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return <ErrorComponent message='Oops, it seems you are not logged in. Please log in.' />;
    }
    return (
        <div className='py-4 md:container '>
            <div className='flex flex-col gap-1 border-b pb-2 px-4 md:flex-row md:items-center md:justify-between'>
                <BackButton link='/bookings' />

                <TabsComponent bookingId={params.bookingid} />
            </div>

            {children}
        </div>
    );
}
