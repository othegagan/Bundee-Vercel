'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import PriceDisplayComponent from '@/components/custom/PriceDisplayComponent';
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

    const { name, image, zipCode, startTime, endTime, airportDelivery } = data;
    console.log(data);

    return (
        <div className='mt-4 min-w-[300px] space-y-4'>
            <div className=' max-h-56 w-full overflow-hidden rounded-md'>
                <img src={image || '/images/image_not_available.png'} className='h-full w-full object-cover object-center md:rounded-md' alt='Vehicle' />
            </div>
            <h2 className='font-bold text-2xl '>{name}</h2>

            <ul className='grid gap-3'>
                <li className='flex flex-col text-14 sm:flex-row sm:justify-between md:items-center'>
                    <div className='text-muted-foreground'>Trip Start Date</div>
                    <div>{formatDateAndTime(startTime, zipCode)}</div>
                </li>
                <li className='flex flex-col text-14 sm:flex-row sm:justify-between md:items-center'>
                    <div className='text-muted-foreground'>Trip End Date</div>
                    <div>{formatDateAndTime(endTime, zipCode)}</div>
                </li>
            </ul>
            <Separator className='my-2' />
            <PriceDisplayComponent pricelist={data} isAirportDeliveryChoosen={airportDelivery} />
        </div>
    );
}
