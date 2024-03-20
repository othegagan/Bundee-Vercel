import React from 'react';
import { toast } from '@/components/ui/use-toast';
import { wishlistHandler } from '@/server/userOperations';

const useWishlist = () => {
    const [isItemWishlisted, setIsItemWishlisted] = React.useState(false);

    const addToWishlistHandler = async vehicleId => {
        setIsItemWishlisted(true);
        try {
            const response = await wishlistHandler(vehicleId, true);
            if (response.success) {
                setIsItemWishlisted(true);
                toast({
                    duration: 4000,
                    variant: 'success',
                    description: 'Vehicle added to the wishlist',
                });
                window.location.reload();
            } else {
                toast({
                    duration: 4000,
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
                    duration: 3000,
                    variant :'success',
                    description: 'Vehicle removed form the wishlist',
                });
                window.location.reload();
            } else {
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    description: 'Something went wrong while removing from wishlist',
                });
                setIsItemWishlisted(false);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };
    return {
        isItemWishlisted,
        addToWishlistHandler,
        removeFromWishlistHandler,
    };
};

export default useWishlist;
