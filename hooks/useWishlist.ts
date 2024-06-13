import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getAllUserWishlistedVehicles, wishlistHandler } from '@/server/userOperations';
import useTabFocusEffect from './useTabFocusEffect';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const useWishlist = (id?: string) => {
    const [isItemWishlisted, setIsItemWishlisted] = useState(false);

    const addToWishlistHandler = async (vehicleId: number) => {
        setIsItemWishlisted(true);
        try {
            const response = await wishlistHandler(vehicleId, true);
            if (response.success) {
                setIsItemWishlisted(true);
                toast({
                    duration: 2500,
                    variant: 'default',
                    description: 'Vehicle added to the wishlist',
                });
                refetch();
                // window.location.reload();
            } else {
                toast({
                    duration: 2500,
                    variant: 'destructive',
                    description: 'Something went wrong while adding to wishlist',
                });
                setIsItemWishlisted(false);
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
        }
    };

    const removeFromWishlistHandler = async (vehicleId: number) => {
        setIsItemWishlisted(false);

        try {
            const response = await wishlistHandler(vehicleId, false);
            if (response.success) {
                toast({
                    duration: 2500,
                    variant: 'default',
                    description: 'Vehicle removed form the wishlist',
                });
                refetch();
                // window.location.reload();
            } else {
                toast({
                    duration: 2500,
                    variant: 'destructive',
                    description: 'Something went wrong while removing from wishlist',
                });
                setIsItemWishlisted(false);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const fetchData = async (id?: string) => {
        try {
            const response = await getAllUserWishlistedVehicles();

            if (response.success && response.data.customervehicleresponse) {
                const VehicleIsInWishlist = response.data.customervehicleresponse.find((vehicle: { id: string; }) => vehicle.id == id);
                setIsItemWishlisted(VehicleIsInWishlist);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchData(id);
    }, []);

    const {
        data: wishlistResponse,
        isFetching: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => getAllUserWishlistedVehicles(),
        refetchOnWindowFocus: true,
    });


    return {
        isItemWishlisted,
        addToWishlistHandler,
        removeFromWishlistHandler,
        loading,
        error,
        wishlistResponse,
    };
};

export default useWishlist;
