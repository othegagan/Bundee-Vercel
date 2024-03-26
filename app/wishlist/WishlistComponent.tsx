'use client';

import React from 'react';
import BoxContainer from '@/components/BoxContainer';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';
import useWishlist from '@/hooks/useWishlist';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IoTrashOutline } from 'react-icons/io5';

const WishlistComponent = () => {
    const router = useRouter();
    const { loading, error, wishlistData, removeFromWishlistHandler } = useWishlist();

    const redirect = vehicleId => {
        const url = `/vehicles/${vehicleId}`;
        router.push(url);
    };

    return (
        <BoxContainer className='mb-6 py-6'>
            <div className='flex flex-col gap-1 pb-2'>
                <h3 className='ml-2 text-2xl font-bold leading-6 text-gray-900'>Wishlist</h3>
                {loading ? (
                    <VehiclesCardsSkeleton />
                ) : error ? (
                    <ErrorComponent message='Something went wrong in getting wishlist vehicles' />
                ) : (
                    <>
                        {wishlistData.length > 0 ? (
                            <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
                                {wishlistData.map((car, index) => (
                                    <WishlistCard key={index} car={car} redirect={redirect} removeFromWishlistHandler={removeFromWishlistHandler} />
                                ))}
                            </div>
                        ) : (
                            <ErrorComponent message='No wishlisted Vehicle found.' />
                        )}
                    </>
                )}
            </div>
        </BoxContainer>
    );
};

const WishlistCard = ({ car, redirect, removeFromWishlistHandler }) => {
    const handleRemoveFromWishlist = () => {
        removeFromWishlistHandler(car.vehicleid);
    };

    return (
        <div className='group relative col-span-1 cursor-pointer rounded-md bg-white px-4 py-4 shadow'>
            <div
                onClick={() => redirect(car.vehicleid)}
                className='aspect-video w-full overflow-hidden rounded-md bg-neutral-200 group-hover:opacity-75 lg:aspect-video lg:h-44'>
                <img
                    src={car.imageresponse[0].imagename}
                    alt=''
                    className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-110 lg:h-full lg:w-full'
                />
            </div>
            <div className='mt-3 flex items-center justify-between'>
                <div>
                    <p className='p-0 text-sm font-bold text-neutral-900'>{`${car.make} ${car.model} ${car.year}`}</p>
                    <div className='flex items-center gap-2'>
                        {car.tripCount != 0 && (
                            <p className='text-xs font-medium text-neutral-900'>
                                {car.tripCount} {car.tripCount == 1 ? 'Trip' : 'Trips'}
                            </p>
                        )}
                        {car.tripCount === 0 && (
                            <span className='me-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300'>
                                New
                            </span>
                        )}
                    </div>
                </div>
                <Button onClick={handleRemoveFromWishlist} className='flex' variant='ghost' size='icon'>
                    <IoTrashOutline className='h-5 w-5 text-red-400' />
                </Button>
            </div>
        </div>
    );
};

export default WishlistComponent;
