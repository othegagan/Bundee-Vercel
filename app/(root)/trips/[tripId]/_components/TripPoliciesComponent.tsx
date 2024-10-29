import { format } from 'date-fns';
import Link from 'next/link';

export default function TripPoliciesComponent({ starttime, cancellationDays }: { starttime: string; cancellationDays?: number }) {
    const calFreeCancellationDate = () => {
        const freeCancellationDate = new Date(starttime);
        freeCancellationDate.setDate(freeCancellationDate.getDate() - Number(cancellationDays));
        return freeCancellationDate;
    };

    return (
        <div className='flex w-full flex-col gap-2'>
            <div className='font-bold text-md '>Policies</div>

            {/* Free Cancellation Date */}
            <div className='flex w-full items-center justify-between gap-2'>
                <div className='flex w-fit flex-col gap-1 text-md'>
                    <p className='text-14 lg:text-16'>Cancelation Policy</p>
                    <p className='text-12 lg:text-14'>Free Cancellation until {format(calFreeCancellationDate(), 'PPP')}</p>
                </div>
                <Link href={'/privacy'} className='underline underline-offset-2'>
                    Read More
                </Link>
            </div>

            <div className='flex w-fullD items-center justify-between gap-2'>
                <div className='flex w-fit flex-col gap-2 text-md'>
                    <p className='text-14 lg:text-16'>Vehicle Policy</p>
                </div>
                <Link href={'/privacy'} className='underline underline-offset-2'>
                    Read More
                </Link>
            </div>
        </div>
    );
}
