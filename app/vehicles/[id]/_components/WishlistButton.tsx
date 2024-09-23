import useWishlist from '@/hooks/useWishlist';
import { getSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { FC, useEffect, useState } from 'react';

interface WishlistButtonProps {
    vehicleId: number;
    variant?: 'sm' | 'lg';
}

export const WishlistButton: FC<WishlistButtonProps> = ({ vehicleId, variant = 'lg' }) => {
    const [session, setSession] = useState<any>({
        isLoggedIn: false,
        userId: null
    });

    useEffect(() => {
        const fetchSession = async () => {
            const session = await getSession();
            setSession(session);
        };
        fetchSession();
    }, []);

    if (!session.isLoggedIn || !session.userId) {
        return null;
    }

    return <MainComponent vehicleId={vehicleId} variant={variant} />;
};

const MainComponent: FC<WishlistButtonProps> = ({ vehicleId, variant }) => {
    const { addToWishlistHandler, removeFromWishlistHandler, isItemWishlisted } = useWishlist(vehicleId);

    return (
        <div
            className={cn(
                ' flex size-10 cursor-pointer items-center justify-center rounded-md border bg-white',
                variant === 'sm' ? 'absolute top-[6%] right-[3%] lg:hidden' : 'hidden lg:flex'
            )}>
            <button type='button' onClick={() => (isItemWishlisted ? removeFromWishlistHandler(vehicleId) : addToWishlistHandler(vehicleId))}>
                <Heart fill={isItemWishlisted ? 'red' : 'none'} className='size-7 text-red-500' />
            </button>
        </div>
    );
};
