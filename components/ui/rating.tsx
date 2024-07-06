'use client';

import React from 'react';

interface RatingProps {
    rating: number;
    setRating: React.Dispatch<React.SetStateAction<number>>;
}

const Rating: React.FC<RatingProps> = ({ rating, setRating }) => {

    const handleMouseLeave = () => {
        setRating(0);
    };

    const handleClick = (index: number) => {
        setRating(index + 1);
    };

    return (
        <div className='flex items-center gap-2'>
            {[...Array(5)].map((_, index) => (
                <Star
                    key={index}
                    index={index}
                    filled={rating > index}
                    onClick={() => handleClick(index)}
                />
            ))}
        </div>
    );
};

interface StarProps {
    filled: boolean;
    index: number;
    onClick: () => void;
}

const Star: React.FC<StarProps> = ({ filled, index, onClick }) => {
    return (
        <button type='button' className='h-10 w-10 cursor-pointer' onClick={onClick}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                className={`h-10 w-10 cursor-pointer ${filled ? 'text-yellow-400' : 'text-neutral-400'}`}
                fill={filled ? 'currentColor' : 'none'}
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.4'
                    d='M12 2L15.09 8.74L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.74L12 2z'
                />
            </svg>
        </button>
    );
};

export default Rating;
