'use client';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { CarCountSkeleton, VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';
import useVehicleSearch from '@/hooks/useVehicleSearch';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa6';
import { toTitleCase } from '@/lib/utils';
import CarFilters from './CarFilters';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import MapComponent from '@/components/map/MapComponent';
import { IoAirplaneSharp } from 'react-icons/io5';
import { MdOutlineDiscount } from 'react-icons/md';
import useCarFilterModal from '@/hooks/useCarFilterModal';
import { Button } from '@/components/ui/button';
import { VscSettings } from 'react-icons/vsc';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Vehicles = ({ searchParams }: any) => {
    const { loading, error, data: carDetails, searchQuery, searchVehicles } = useVehicleSearch();
    const useCarFilter = useCarFilterModal();

    const pathname = usePathname();

    useScrollToTopOnLoad(loading);

    useEffect(() => {
        searchVehicles();
    }, [searchParams]);

    return (
        <div className=''>
            <div
                className={`z-[29] px-4 ${pathname == '/' ? 'block rounded-md' : '-mx-4'} flex flex-col bg-white py-3 md:sticky md:top-[9.5rem] md:flex-row md:items-center md:justify-between`}>
                <h1 className='text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl'>Available Cars</h1>

                <div className='flex items-center justify-between gap-4'>
                    {!loading ? (
                        <p className='text-sm font-medium text-neutral-600'>{useCarFilter.filteredCars.length} vehicles found.</p>
                    ) : (
                        <CarCountSkeleton />
                    )}
                    <Button className='flex gap-3 ' variant='outline' type='button' onClick={useCarFilter.onOpen}>
                        <VscSettings className='rotate-90' />
                        Filters{' '}
                        {useCarFilter.appliedFiltersCount > 0 ? <p>({useCarFilter.appliedFiltersCount > 0 ? useCarFilter.appliedFiltersCount : ''})</p> : null}
                    </Button>
                </div>
            </div>
            {loading ? (
                <VehiclesCardsSkeleton />
            ) : (
                <>
                    {error ? (
                        <ErrorComponent />
                    ) : useCarFilter.filteredCars.length === 0 ? (
                        <ErrorComponent message='Apologies, but no cars are available within your selected date range. Please adjust your filters to find available options.' />
                    ) : (
                        <div className=''>
                            <div className=' grid grid-cols-1 gap-5 sm:grid-cols-2 md:hidden md:gap-x-6 md:gap-y-8 lg:grid-cols-3  xl:gap-x-8'>
                                {useCarFilter.filteredCars.map((car: any) => (
                                    <CarCard key={car.id} car={car} searchQuery={searchQuery} />
                                ))}
                            </div>

                            <div className=' hidden w-full md:grid md:grid-cols-5 md:gap-x-6 md:gap-y-8'>
                                <div className=' w-full gap-5 md:col-span-3 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-8 '>
                                    {useCarFilter.filteredCars.map((car: any) => (
                                        <CarCard key={car.id} car={car} searchQuery={searchQuery} />
                                    ))}
                                </div>
                                <div className='h-[700px] md:sticky md:top-[14rem] md:col-span-2 md:min-w-full'>
                                    <MapComponent filteredCars={useCarFilter.filteredCars} searchQuery={searchQuery} />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Vehicles;

export function CarCard({ car, searchQuery }: { car: any; searchQuery: any }) {
    const images: any = [...car.imageresponse].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) {
            return -1;
        } else if (!a.isPrimary && b.isPrimary) {
            return 1;
        } else {
            return a.orderNumber - b.orderNumber;
        }
    });
    return (
        <div className='custom-shadow group h-fit  rounded-lg bg-white hover:shadow-md'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg '>
                <Link
                    href={`/vehicles/${car.id}?${searchQuery}`}
                    className='aspect-video h-44 w-full cursor-pointer overflow-hidden rounded-t-md bg-neutral-200 group-hover:opacity-[0.9] lg:aspect-video lg:h-44'>
                    {images[0]?.imagename ? (
                        <img
                            src={images[0].imagename}
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
                </Link>

                <div className='absolute bottom-2 left-1 inline-flex scale-[0.8] items-center rounded-lg bg-white p-2 shadow-md'>
                    <FaStar className='mr-2 h-4 w-4 text-yellow-400' />
                    <span className=' text-sm text-neutral-700'>
                        {car?.rating} • ({car?.tripcount} {car?.tripcount === 1 ? 'Trip' : 'Trips'})
                    </span>
                </div>
            </div>

            <div className='mt-1 flex flex-wrap justify-between p-3'>
                <div className=''>
                    <Link
                        href={`/vehicles/${car.id}?${searchQuery}`}
                        className='cursor-pointer text-base font-semibold text-neutral-800'>{`${toTitleCase(car?.make)} ${car?.model.toLocaleUpperCase()} ${car?.year}`}</Link>
                    <p className='mt-1 text-sm text-neutral-500'>
                        {toTitleCase(car?.cityname)}, {toTitleCase(car?.state)}
                    </p>
                </div>

                <div className='flex flex-col items-end gap-3'>
                    <p>
                        <span className='text-lg font-bold text-primary'>${car.price_per_hr}</span>
                        <span className='text-md text-neutral-600'>/Day</span>
                    </p>
                    <div className='flex gap-2'>
                        {car?.airportDelivery ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <IoAirplaneSharp className='size-5 -rotate-90 text-primary' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Airport Delivery Available</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : null}
                        {car?.isDiscountAvailable ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <MdOutlineDiscount className='size-5 text-green-500' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Discount Available</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : null}
                    </div>{' '}
                </div>
            </div>
        </div>
    );
}
