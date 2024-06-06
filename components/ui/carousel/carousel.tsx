import React, { useState, useEffect } from 'react';

const Carousel = ({ children: slides, autoSlide = false, autoSlideInterval = 3000 }) => {
    const [curr, setCurr] = useState(0);

    const prev = () => setCurr(curr => (curr === 0 ? slides.length - 1 : curr - 1));

    const next = () => setCurr(curr => (curr === slides.length - 1 ? 0 : curr + 1));

    useEffect(() => {
        if (!autoSlide) return;
        const slideInterval = setInterval(next, autoSlideInterval);
        return () => clearInterval(slideInterval);
    }, [autoSlide, autoSlideInterval, next]);

    return (
        <div className='relative overflow-hidden'>
            <div className='flex max-h-96 transition-transform duration-500 ease-out' style={{ transform: `translateX(-${curr * 100}%)` }}>
                {slides}
            </div>
            <div className='absolute inset-0 flex items-center justify-between p-4'>
                <button onClick={prev} className='rounded-full bg-white/80 p-1 text-gray-800 shadow hover:bg-white'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'>
                        <polyline points='15 18 9 12 15 6'></polyline>
                    </svg>
                </button>
                <button onClick={next} className='rounded-full bg-white/80 p-1 text-gray-800 shadow hover:bg-white'>
                    <svg
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'>
                        <polyline points='9 18 15 12 9 6'></polyline>
                    </svg>
                </button>
            </div>
            <div className='absolute bottom-4 left-0 right-0'>
                <div className='flex items-center justify-center gap-2'>
                    {slides.map((s, i) => (
                        <div key={i} className={`h-1.5 w-1.5 rounded-full bg-white transition-all  ${curr === i ? 'p-0.5' : 'bg-opacity-50'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Carousel;
