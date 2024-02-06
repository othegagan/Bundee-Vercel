import React from 'react';
import { Button } from '@/components/ui/button'; // Import your UI library or use native HTML button
import { addToWishlist } from '@/app/_actions/addtowishlist';
import { removeUserWishlistVehicle } from '@/app/_actions/unwislist';
import { toast } from '@/components/ui/use-toast';

const useWishlist = () => {
    const [isItemWishlisted, setIsItemWishlisted] = React.useState(false);

    const addToWishlistHandler = async vehicleId => {
        setIsItemWishlisted(true);
        const user = localStorage.getItem('userId');
        const token = localStorage.getItem('auth_token_login');

        try {
            const response = await addToWishlist(user, vehicleId, token);
            if (response.success) {
                setIsItemWishlisted(true);
                toast({
                    duration: 3000,
                    className: 'bg-green-400 text-white',
                    title: 'Added to Wishlist',
                    description: 'The vehicle is successfully added to the wishlist',
                });
                window.location.reload();
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
        }
    };

    const removeFromWishlistHandler = async vehicleId => {
        setIsItemWishlisted(false);
        const user = localStorage.getItem('userId');
        const token = localStorage.getItem('auth_token_login');

        try {
            const response = await removeUserWishlistVehicle(user, vehicleId, token);
            if (response.code === '0') {
                toast({
                    duration: 3000,
                    title: 'Removed From Wishlist',
                    description: 'The vehicle is successfully removed from the wishlist',
                });
                window.location.reload();
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

