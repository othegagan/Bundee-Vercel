import { getAllUserWishlistedVehicles, wishlistHandler } from '@/server/userOperations';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const useWishlist = (vehicleId?: number) => {
    const [isItemWishlisted, setIsItemWishlisted] = useState(false);

    const addToWishlistHandler = async (vehicleId: number) => {
        setIsItemWishlisted(true);
        try {
            const response = await wishlistHandler(vehicleId, true);
            if (response.success) {
                setIsItemWishlisted(true);
                toast.success('Vehicle added to the wishlist');
                refetch();
                // window.location.reload();
            } else {
                toast.error('Something went wrong while adding to wishlist');
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
                toast.success('Vehicle removed form the wishlist');
                refetch();
                // window.location.reload();
            } else {
                toast.error('Something went wrong while removing from wishlist');
                setIsItemWishlisted(false);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const fetchData = async (vehicleId?: number) => {
        try {
            const response = await getAllUserWishlistedVehicles();

            if (response.success && response.data.customervehicleresponse) {
                const VehicleIsInWishlist = response.data.customervehicleresponse.find((vehicle: { id: number }) => vehicle.id === vehicleId);
                setIsItemWishlisted(VehicleIsInWishlist);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchData(vehicleId);
    }, []);

    const {
        data: wishlistResponse,
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => getAllUserWishlistedVehicles(),
        refetchOnWindowFocus: true,
        staleTime: 1000
    });

    return {
        isItemWishlisted,
        addToWishlistHandler,
        removeFromWishlistHandler,
        loading,
        error,
        wishlistResponse
    };
};

export default useWishlist;
