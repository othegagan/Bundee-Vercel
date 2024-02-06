import React from 'react';

const NoCarsFound = ({ isWishlist }: any) => {
    return (
        <main className=' mx-auto mt-4 grid  min-h-full max-w-7xl place-items-center bg-primary/5 px-6 py-24 sm:px-0 sm:py-32 md:px-8 lg:px-8'>
            <div className='px-4 text-center'>
                <h1 className='mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl'>No cars found.! </h1>
                {!isWishlist ? (
                    <p className='mt-6 text-base leading-7 text-gray-600'>
                        We apologize, but we couldn't find any cars within your selected date range. <br /> Try changing your filters.
                    </p>
                ) : null}

                <div className='mt-10 flex items-center justify-center gap-x-6'></div>
            </div>
        </main>
    );
};

export default NoCarsFound;
