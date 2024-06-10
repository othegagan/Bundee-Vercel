import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getAllUserWishlistedVehicles, wishlistHandler } from '@/server/userOperations';
import useTabFocusEffect from './useTabFocusEffect';

const useWishlist = (id?: string) => {
    const [isItemWishlisted, setIsItemWishlisted] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [wishlistData, setWishlistData] = useState([]);

    const addToWishlistHandler = async vehicleId => {
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

    const removeFromWishlistHandler = async vehicleId => {
        setIsItemWishlisted(false);

        try {
            const response = await wishlistHandler(vehicleId, false);
            if (response.success) {
                toast({
                    duration: 2500,
                    variant: 'default',
                    description: 'Vehicle removed form the wishlist',
                });
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
        setLoading(true);
        setError(false);

        try {
            const response = await getAllUserWishlistedVehicles();

            if (response.success && response.data.customervehicleresponse) {
                
                const VehicleIsInWishlist = response.data.customervehicleresponse.find(vehicle => vehicle.id == id);
                setIsItemWishlisted(VehicleIsInWishlist);

                setWishlistData(response.data.customervehicleresponse);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching data', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(id);
    }, []);

    useTabFocusEffect(() => {
        fetchData(id);
    }, []);

    useTabFocusEffect(() => {
        fetchData(id);
    }, []);

    return {
        isItemWishlisted,
        addToWishlistHandler,
        removeFromWishlistHandler,
        loading,
        error,
        wishlistData,
    };
};

export default useWishlist;
