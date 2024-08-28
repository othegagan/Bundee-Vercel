'use client';
import { usePathname } from 'next/navigation';
import NotificationsComponent from './Notifications';

export default function UserInfo({ email }: { email: string }) {
    const pathname = usePathname();

    if (pathname === '/test') return null;

    return (
        <>
            <NotificationsComponent />
            <p className='hidden text-xs sm:block'>{email}</p>
        </>
    );
}
