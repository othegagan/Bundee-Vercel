'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabsComponent({ bookingId }: { bookingId?: string }) {
    const pathname = usePathname();
    return (
        <div
            role='tablist'
            aria-orientation='horizontal'
            className='mt-4 grid h-14 w-full max-w-lg grid-cols-2 items-center justify-center gap-4 rounded-lg bg-neutral-100 p-1 px-3 text-muted-foreground'
            data-orientation='horizontal'>
            <Link
                href={`/bookings/${bookingId}/details`}
                type='button'
                role='tab'
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                        ${pathname === `/bookings/${bookingId}/details` ? 'bg-primary text-white shadow' : 'bg-neutral-100 text-muted-foreground'}`}>
                Booking Details
            </Link>

            <Link
                href={`/bookings/${bookingId}/conversation`}
                type='button'
                role='tab'
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                        ${pathname === `/bookings/${bookingId}/conversation` ? 'bg-primary text-white shadow' : 'bg-neutral-100 text-muted-foreground'}`}>
                Conversation
            </Link>
        </div>
    );
}
