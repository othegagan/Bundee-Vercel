'use client';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';
import useVehicleSearch from '@/hooks/useVehicleSearch';
import { toTitleCase } from '@/lib/utils';
import Link from 'next/link';
import { useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import NoCarsFound from './NoCarsFound';

const Vehicles = ({ searchParams }: any) => {
    const { loading, error, data: carDetails, searchQuery, searchVehicles } = useVehicleSearch();

    useEffect(() => {
        const token = localStorage.getItem('bundee_auth_token');
        searchVehicles(searchParams, token);
    }, [searchParams]);

    if (loading) return <VehiclesCardsSkeleton />;
    if (error) return <ErrorComponent />;
    if (!loading && carDetails.length == 0) return <NoCarsFound />;

    return (
        <div className='my-6'>
            <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                <h2 className='text-xl font-bold tracking-tight text-neutral-900'>Available Cars</h2>
                <p className='text-sm font-medium'>{carDetails.length} cars available to picked up in this city.</p>
            </div>

            <div className='mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-x-6 md:gap-y-8 lg:grid-cols-3  xl:gap-x-8'>
                {carDetails.map((car: any) => (
                    <CarCard key={car.id} car={car} searchQuery={searchQuery} />
                ))}
            </div>
        </div>
    );
};

export default Vehicles;

export function CarCard({ car, searchQuery }: { car: any; searchQuery: any }) {
    return (
        <Link href={`/vehicles/${car.id}?${searchQuery}`} className='custom-shadow group cursor-pointer rounded-lg bg-white hover:shadow-md '>
            <div className='relative flex items-end overflow-hidden rounded-t-lg '>
                <div className='aspect-video w-full overflow-hidden rounded-t-md bg-neutral-200 group-hover:opacity-[0.9] lg:aspect-video lg:h-44'>
                    {car.imageresponse[0]?.imagename ? (
                        <img
                            src={car.imageresponse[0].imagename}
                            alt={car.make}
                            className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-105 lg:h-full lg:w-full'
                        />
                    ) : (
                        <img
                            src='./image_not_available.png'
                            alt='image_not_found'
                            className='h-full w-full scale-[0.7] object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full'
                        />
                    )}
                </div>

                <div className='absolute bottom-2 left-1 inline-flex scale-[0.8] items-center rounded-lg bg-white p-2 shadow-md'>
                    <FaStar className='mr-2 h-4 w-4 text-yellow-400' />
                    <span className=' text-sm text-neutral-700'>
                        {car.rating} • ({car?.tripcount} {car?.tripcount === 1 ? 'Trip' : 'Trips'})
                    </span>
                </div>
            </div>

            <div className='mt-1 flex flex-wrap justify-between p-3'>
                <div className=''>
                    <h2 className='font-semibold text-neutral-800'>{`${toTitleCase(car?.make)} ${car?.model.toLocaleUpperCase()} ${car?.year}`}</h2>
                    <p className='mt-1 text-sm text-neutral-500'>
                        {toTitleCase(car?.cityname)}, {toTitleCase(car?.state)}
                    </p>
                </div>

                <p>
                    <span className='text-lg font-bold text-primary'>${car.price_per_hr}</span>
                    <span className='text-md text-neutral-600'>/Day</span>
                </p>
            </div>
        </Link>
    );
}
