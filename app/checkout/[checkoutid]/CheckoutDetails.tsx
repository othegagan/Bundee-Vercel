'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { CheckoutDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/auth';
import { formatDateAndTime } from '@/lib/utils';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';

export function useCheckoutDetails() {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const session = await getSession();

                const data = JSON.parse(secureLocalStorage.getItem('checkOutInfo') as any);

                if (data && session.isLoggedIn) {
                    setData(data);
                } else {
                    setError(true);
                    return;
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { data, loading, error };
}

export default function CheckoutDetails() {
    const { data, loading, error } = useCheckoutDetails();

    if (error) return <ErrorComponent />;

    if (loading) return <CheckoutDetailsSkeleton />;

    const { name, image, zipCode, startTime, endTime, totalDays, tripamount, taxAmount, tripTaxAmount } = data;

    return (
        <div className='mt-4 min-w-[300px] space-y-4'>
            <div className='rounded-lg overflow-hidden'>
                <img src={image || '/images/image_not_available.png'} className='max-h-fit min-w-full' alt='Vehicle' />
            </div>
            <h2 className='text-2xl font-bold '>{name}</h2>

            <ul className='grid gap-3'>
                <li className='text-14 flex flex-col sm:flex-row md:items-center sm:justify-between'>
                    <div className='text-muted-foreground'>Trip Start Date</div>
                    <div>{formatDateAndTime(startTime, zipCode)}</div>
                </li>
                <li className='text-14 flex flex-col sm:flex-row md:items-center sm:justify-between'>
                    <div className='text-muted-foreground'>Trip End Date</div>
                    <div>{formatDateAndTime(endTime, zipCode)}</div>
                </li>
            </ul>
            <Separator className='my-2' />
            <ul className='grid gap-3'>
                <li className='flex items-center justify-between'>
                    <span className=' text-muted-foreground'>Trip Duration</span>
                    <span>
                        {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                    </span>
                </li>
                <li className='flex items-center justify-between'>
                    <span className=' text-muted-foreground'>Trip Amount</span>
                    <span>${tripamount.toFixed(2)}</span>
                </li>
                <li className='flex items-center justify-between'>
                    <span className=' text-muted-foreground'>Tax</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </li>
                <Separator />
                <li className='flex items-center justify-between font-semibold'>
                    <span className='text-lg'>Total Amount</span>
                    <span>${tripTaxAmount.toFixed(2)}</span>
                </li>
            </ul>
        </div>
    );
}
