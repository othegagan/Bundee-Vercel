import { format } from 'date-fns';
import React from 'react';

export default function FreeCancellationDate({ tripsData }: any) {
    const calFreeCancellationDate = () => {
        const freeCancellationDate = new Date(tripsData.starttime);
        freeCancellationDate.setDate(freeCancellationDate.getDate() - Number(tripsData.cancellationDays));
        return freeCancellationDate;
    };

    return (
        <div className='mt-4 flex w-full items-center justify-center rounded-md bg-red-50 px-2 py-3 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10'>
            <p className='text-center '>
                Free Cancellation till <b className='ml-2'> {format(calFreeCancellationDate(), 'PPP')}</b>
            </p>
        </div>
    );
}
