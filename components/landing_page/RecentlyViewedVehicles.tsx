'use client';

import { toTitleCase } from '@/lib/utils';
import { clearRecentlyViewedVehicles, getRecentlyViewedVehicles } from '@/server/userOperations';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa6';
import { toast } from 'sonner';
import BoxContainer from '../BoxContainer';
import ClientOnly from '../ClientOnly';
import { Button } from '../ui/button';

export default function RecentlyViewedVehicles() {
    const [recentlyViewedData, setRecentlyViewedData] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleClearRecentlyViewedVehicles() {
        const status = await clearRecentlyViewedVehicles();
        if (status.success) {
            setRecentlyViewedData([]);
            toast.success('Your vehicle viewing history has been cleared.');
        } else {
            toast.error('Oops, Something went wrong and try again.');
        }
    }

    const fetchRecentlyViewed = async () => {
        try {
            setLoading(true);
            const response = await getRecentlyViewedVehicles();
            // console.log(response.data.customeractivityresponse)
            if (response.success) {
                const data = response.data.customeractivityresponse || [];
                setRecentlyViewedData(data.slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentlyViewed();
    }, []);

    if (loading) {
        return;
    }

    if (!loading && recentlyViewedData.length === 0) {
        return;
    }

    return (
        <BoxContainer className='space-y-2'>
            <ClientOnly>
                <div className='flex items-center justify-between'>
                    <h3>Recently Viewed</h3>
                    <Button onClick={handleClearRecentlyViewedVehicles} variant='secondary'>
                        Clear All
                    </Button>
                </div>

                <div className='w-full'>
                    <div className='mt-4 grid grid-cols-1 gap-5 md:grid-cols-4'>
                        {recentlyViewedData.map((car: any) => (
                            <Link className='rounded-md bg-white shadow ' key={car.id} href={`/vehicles/${car.vehicleid}`}>
                                <div className='group relative cursor-pointer' key={car.id}>
                                    <div className='aspect-video w-full overflow-hidden rounded-md bg-neutral-200 group-hover:opacity-75 lg:aspect-video lg:h-44'>
                                        <img
                                            src={car?.imageresponse[0]?.imagename}
                                            alt={car?.imageresponse[0]?.imagename}
                                            className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-110 lg:h-full lg:w-full'
                                        />
                                    </div>

                                    <div className=' p-2'>
                                        <p className=' font-bold text-neutral-900 text-sm'>{`${toTitleCase(car?.make)} ${car?.model.toLocaleUpperCase()} ${car?.year}`}</p>
                                        <div className='flex h-auto items-center justify-between '>
                                            <div className='flex gap-2'>
                                                {car.rating ? <p className='font-medium text-neutral-900 text-xs '>{car.rating}</p> : <>{car.rating}</>}
                                                {car.tripCount !== 0 && (
                                                    <div className='mt-1 inline-flex gap-2'>
                                                        <FaStar className=' size-4 text-yellow-400' />
                                                        <span className='font-medium text-neutral-900 text-xs '>
                                                            ({car.tripCount} {car.tripCount === 1 ? 'Trip' : 'Trips'})
                                                        </span>
                                                    </div>
                                                )}
                                                {car.tripCount === 0 && (
                                                    <span className=' rounded-md bg-green-50 px-2 py-1 font-medium text-green-700 text-xs ring-1 ring-green-600/20 ring-inset'>
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <p className='font-bold text-neutral-900 text-xs'>${car.vehiclePrice}/ Day</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </ClientOnly>
        </BoxContainer>
    );
}
