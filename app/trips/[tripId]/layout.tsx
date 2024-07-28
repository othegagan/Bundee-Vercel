import ErrorComponent from '@/components/custom/ErrorComponent';
import { getSession } from '@/lib/auth';
import type React from 'react';

export default async function layout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return <ErrorComponent message='Oops, it seems you are not logged in. Please log in.' />;
    }
    return <div className='py-4 md:container '>{children}</div>;
}
