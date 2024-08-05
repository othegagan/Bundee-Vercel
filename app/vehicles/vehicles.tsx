'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { CarCountSkeleton, VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';
import useVehicleSearch from '@/hooks/useVehicleSearch';
import { sortImagesByIsPrimary, toTitleCase } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa6';

import MapComponent from '@/components/map/MapComponent';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useCarFilterDialog from '@/hooks/dialogHooks/useCarFilterDialog';
import useScrollToTopOnLoad from '@/hooks/useScrollToTopOnLoad';
import { Car, Map as MapIcon } from 'lucide-react';
import { IoAirplaneSharp } from 'react-icons/io5';
import { MdOutlineDiscount } from 'react-icons/md';
import { VscSettings } from 'react-icons/vsc';

const Vehicles = ({ searchParams }: any) => {
    const { loading, error, data: carDetails, searchQuery, searchVehicles } = useVehicleSearch();
    const useCarFilter = useCarFilterDialog();
    const [show, setShow] = useState(false);

    useScrollToTopOnLoad(loading);

    useEffect(() => {
        searchVehicles();
    }, [searchParams]);

    return (
        <div className='h-[calc(100dvh_-_185px)] '>
            {/* Mobile View components */}
            <div className='sticky top-0 z-40 my-2  flex w-full items-center justify-between bg-white py-1 lg:hidden'>
                {loading || useCarFilter.isLoading ? (
                    <CarCountSkeleton />
                ) : (
                    <h1 className='text-sm font-semibold tracking-tight text-neutral-800 md:text-xl '>
                        {useCarFilter.filteredCars.length > 0 ? `${useCarFilter.filteredCars.length}  cars found are available.` : ''}
                    </h1>
                )}
                <div className='flex items-center gap-3'>
                    <Button
                        className=' flex gap-3'
                        variant='outline'
                        size='sm'
                        type='button'
                        onClick={() => {
                            setShow(!show);
                        }}>
                        {!show ? (
                            <div className='flex items-center gap-1'>
                                <MapIcon className='size-4 text-neutral-500' />
                                Map View
                            </div>
                        ) : (
                            <div className='flex items-center gap-1'>
                                <Car className='size-4 text-neutral-500' />
                                Cars View
                            </div>
                        )}
                    </Button>
                    <Button className=' flex gap-3' variant='black' size='sm' type='button' onClick={useCarFilter.onOpen}>
                        <VscSettings className='rotate-90' />
                        Filters
                        {useCarFilter.appliedFiltersCount > 0 ? <p>({useCarFilter.appliedFiltersCount > 0 ? useCarFilter.appliedFiltersCount : ''})</p> : null}
                    </Button>
                </div>
            </div>

            <div className='grid h-full w-full grid-cols-1 gap-4 overflow-y-auto lg:hidden'>
                {show ? (
                    <div className='col-span-1 '>
                        {loading && !error ? (
                            <div className='my-10 grid place-content-center tracking-wider'> LOADING MAP..</div>
                        ) : (
                            <MapComponent searchQuery={searchQuery} filteredCars={useCarFilter.filteredCars} />
                        )}
                    </div>
                ) : (
                    <div className='col-span-1'>
                        {loading || useCarFilter.isLoading ? (
                            <VehiclesCardsSkeleton columns='2' />
                        ) : (
                            <>
                                {error && !useCarFilter.isLoading ? (
                                    <ErrorComponent />
                                ) : !useCarFilter.isLoading && useCarFilter.filteredCars.length === 0 ? (
                                    <ErrorComponent message='Apologies, but no cars are available within your selected date range. Please adjust your filters to find available options.' />
                                ) : (
                                    <div className=' grid w-full gap-5 md:col-span-3 md:grid-cols-2 md:gap-x-4 md:gap-y-4 '>
                                        {useCarFilter.filteredCars.map((car: any) => (
                                            <CarCard key={car.id} car={car} searchQuery={searchQuery} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop components */}
            <div className='hidden h-full grid-cols-1 gap-4 lg:grid lg:grid-cols-5'>
                <div className='col-span-1 overflow-y-auto lg:col-span-3'>
                    <div className='sticky top-0 z-40 my-2  hidden w-full justify-between bg-white py-1 lg:flex'>
                        {loading || useCarFilter.isLoading ? (
                            <CarCountSkeleton />
                        ) : (
                            <h1 className='text-sm font-semibold tracking-tight text-neutral-800 md:text-xl '>
                                {useCarFilter.filteredCars.length > 0 ? `${useCarFilter.filteredCars.length}  cars found are available.` : ''}
                            </h1>
                        )}

                        <div className='flex items-center gap-3'>
                            <Button className='mr-2 flex gap-1' variant='black' size='sm' type='button' onClick={useCarFilter.onOpen}>
                                <VscSettings className='size-4 rotate-90' />
                                Filters
                                {useCarFilter.appliedFiltersCount > 0 ? (
                                    <p>({useCarFilter.appliedFiltersCount > 0 ? useCarFilter.appliedFiltersCount : ''})</p>
                                ) : null}
                            </Button>
                        </div>
                    </div>

                    {loading || useCarFilter.isLoading ? (
                        <VehiclesCardsSkeleton columns='2' />
                    ) : (
                        <>
                            {error && !useCarFilter.isLoading ? (
                                <ErrorComponent />
                            ) : !useCarFilter.isLoading && useCarFilter.filteredCars.length === 0 ? (
                                <ErrorComponent message='Apologies, but no cars are available within your selected date range. Please adjust your filters to find available options.' />
                            ) : (
                                <div className=' grid w-full gap-5 md:col-span-3 md:grid-cols-2 md:gap-x-4 md:gap-y-4 '>
                                    {useCarFilter.filteredCars.map((car: any) => (
                                        <CarCard key={car.id} car={car} searchQuery={searchQuery} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className='col-span-1 h-full w-full overflow-clip rounded lg:col-span-2'>
                    {loading && !error ? (
                        <div className='grid place-content-center tracking-wider'> LOADING MAP..</div>
                    ) : (
                        <MapComponent searchQuery={searchQuery} filteredCars={useCarFilter.filteredCars} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Vehicles;

export function CarCard({ car, searchQuery }: { car: any; searchQuery: any }) {
    const images: any = sortImagesByIsPrimary(car.imageresponse);
    return (
        <div className='group h-fit rounded-lg  border bg-white hover:shadow-md'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg '>
                <Link
                    href={`/vehicles/${car.id}?${searchQuery}`}
                    className='aspect-video h-44 w-full cursor-pointer overflow-hidden rounded-t-md bg-neutral-200 group-hover:opacity-[0.9] lg:aspect-video lg:h-40'>
                    {images[0]?.imagename ? (
                        <img
                            src={images[0].imagename}
                            alt={car.make}
                            className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-105 lg:h-full lg:w-full'
                        />
                    ) : (
                        <img
                            src='./images/image_not_available.png'
                            alt='image_not_found'
                            className='h-full w-full  object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full'
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

            <div className='mt-1 flex  justify-between p-3'>
                <div className=''>
                    <Link
                        href={`/vehicles/${car.id}?${searchQuery}`}
                        className='cursor-pointer truncate text-base font-semibold text-neutral-800'>{`${toTitleCase(car?.make)} ${car?.model.toLocaleUpperCase()} ${car?.year}`}</Link>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
