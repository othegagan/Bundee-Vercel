'use client';

import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import useWishlist from '@/hooks/useWishlist';
import { toTitleCase } from '@/lib/utils';
import Link from 'next/link';
import type React from 'react';
import { FaStar } from 'react-icons/fa';
import { IoTrashOutline } from 'react-icons/io5';

const WishlistComponent = () => {
    return (
        <BoxContainer className='mb-6 py-6'>
            <div className='flex flex-col gap-1 pb-2'>
                <h3 className='ml-2 text-2xl font-bold leading-6 text-gray-900'>Wishlist</h3>
            </div>
            <MainComponent />
        </BoxContainer>
    );
};

const MainComponent = () => {
    const { loading, error, wishlistResponse, removeFromWishlistHandler } = useWishlist();

    if (loading) {
        return <VehiclesCardsSkeleton />;
    }

    if (error || !wishlistResponse.success) {
        return <ErrorComponent message='Something went wrong in getting wishlist vehicles' />;
    }

    if (wishlistResponse.data.customervehicleresponse.length === 0) {
        return <ErrorComponent message='No wishlisted Vehicle found.' />;
    }

    return (
        <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8'>
            {wishlistResponse.data?.customervehicleresponse.map((car: any, index: React.Key) => (
                <WishlistCard key={index} car={car} removeFromWishlistHandler={removeFromWishlistHandler} />
            ))}
        </div>
    );
};

const WishlistCard = ({ car, removeFromWishlistHandler }) => {
    const handleRemoveFromWishlist = () => {
        removeFromWishlistHandler(car.vehicleid);
    };

    return (
        <div className='group h-fit rounded-lg  border bg-white hover:shadow'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg '>
                <Link
                    href={`/vehicles/${car.vehicleid}`}
                    className='aspect-video h-44 w-full cursor-pointer overflow-hidden rounded-t-md bg-neutral-200 group-hover:opacity-[0.9] lg:aspect-video lg:h-40'>
                    {car.imageresponse[0].imagename ? (
                        <img
                            src={car.imageresponse[0].imagename}
                            alt={car.make}
                            className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-105 lg:h-full lg:w-full'
                        />
                    ) : (
                        <img
                            src='./images/image_not_available.png'
                            alt='image_not_found'
                            className='h-full w-full scale-[0.7] object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full'
                        />
                    )}
                </Link>

                <div className='absolute bottom-2 left-1 inline-flex scale-[0.8] items-center rounded-lg bg-white p-2 shadow-md'>
                    <FaStar className='mr-2 h-4 w-4 text-yellow-400' />
                    <span className=' text-sm text-neutral-700'>
                        {car?.rating} • ({car?.tripCount} {car?.tripCount === 1 ? 'Trip' : 'Trips'})
                    </span>
                </div>
            </div>

            <div className='mt-1 flex items-center justify-between p-3'>
                <Link href={`/vehicles/${car.vehicleid}`} className='cursor-pointer truncate  text-neutral-800'>
                    <p className='text-lg font-semibold text-neutral-800'>{`${toTitleCase(car?.make)} ${car?.model.toLocaleUpperCase()} ${car?.year}`}</p>
                </Link>

                <Button onClick={handleRemoveFromWishlist} className='flex' variant='ghost' size='icon'>
                    <IoTrashOutline className='h-5 w-5 text-red-400' />
                </Button>
            </div>
        </div>
    );
};

export default WishlistComponent;
