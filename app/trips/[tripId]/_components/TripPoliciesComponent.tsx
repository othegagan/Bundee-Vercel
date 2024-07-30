import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';

export default function TripPoliciesComponent({ starttime, cancellationDays }: { starttime: string; cancellationDays?: number }) {
    const calFreeCancellationDate = () => {
        const freeCancellationDate = new Date(starttime);
        freeCancellationDate.setDate(freeCancellationDate.getDate() - Number(cancellationDays));
        return freeCancellationDate;
    };

    return (
        <div className='flex flex-col gap-2 w-full'>
            <div className='text-md font-bold '>Policies</div>

            {/* Free Cancellation Date */}
            <div className='flex gap-2 items-center justify-between w-full'>
                <div className='text-md w-fit flex flex-col  gap-1'>
                    <p className='text-14 lg:text-16'>Cancelation Policy</p>
                    <p className='text-12 lg:text-14'>Free Cancellation until {format(calFreeCancellationDate(), 'PPP')}</p>
                </div>
                <Link href={'/privacy'} className='underline underline-offset-2'>
                    Read More
                </Link>
            </div>

            <div className='flex gap-2 items-center justify-between w-fullD'>
                <div className='text-md w-fit flex flex-col  gap-2'>
                    <p className='text-14 lg:text-16'>Vehicle Policy</p>
                </div>
                <Link href={'/privacy'} className='underline underline-offset-2'>
                    Read More
                </Link>
            </div>
        </div>
    );
}
