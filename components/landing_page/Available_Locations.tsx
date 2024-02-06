'use client';

import Link from 'next/link';
import React from 'react';

const locations = [
    {
        id: 1,
        isactive: true,
        location: 'Austin,Texas,USA',
        disabled: false,
        button_text: 'Search Now',
        imageUrl: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXVzdGluJTIwdGV4YXN8ZW58MHx8MHx8fDA%3D',
        link: '/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129',
    },
    {
        id: 2,
        isactive: false,
        location: 'Dallas,Texas,USA',
        disabled: false,
        button_text: 'Coming Soon',
        imageUrl: 'https://www.tshaonline.org/images/handbook/entries/DD/dallas_skyline.jpg',
        link: '/vehicles?city=Dallas,%20Texas,%20United%20States&latitude=-96.796856&longitude=32.776272',
    },
    {
        id: 3,
        isactive: false,
        location: 'Houston,Texas,USA',
        disabled: false,
        button_text: 'Coming Soon',
        imageUrl: 'https://media.istockphoto.com/id/1004243142/photo/houston-texas-usa-skyline.jpg?s=612x612&w=0&k=20&c=SCMdgr9vKLgUVK7LPDN-PXkz5SAKdrQac97tYFQCEGY=',
        link: '/vehicles?city=Houston,%20Texas,%20United%20States&latitude=-95.367697&longitude=29.758938',
    },
    {
        id: 4,
        isactive: false,
        location: 'San Antonio, Texas, USA',
        disabled: true,
        button_text: 'Coming Soon',
        imageUrl: 'https://media.istockphoto.com/id/1292013336/photo/river-walk-in-san-antonio-city-downtown-skyline-cityscape-of-texas-usa.jpg?s=612x612&w=0&k=20&c=FnzOc9hVq6aNpE7450iIRYYbKpJqDdE4hbY78SKgUY8=',
        link: '/vehicles?city=San%20Antonio,%20Texas,%20United%20States&latitude=-98.495141&longitude=29.4246',
    },
];

const Available_Locations = () => {
    return (
        <>
            <div className='mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8 w-full'>
                <div className='flex justify-between'>
                    <h2 className='text-xl font-bold tracking-tight text-neutral-900'>Available Locations</h2>
                </div>

                <div className='mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
                    {locations.map(location => (
                        <Link href={location.link} className='group relative cursor-pointer' key={location.id}>
                            <div className='aspect-video w-full shadow-md overflow-hidden rounded-md bg-neutral-200 lg:aspect-square h-44'>
                                <img src={location.imageUrl} alt={location.location} className='h-full w-full object-cover group-hover:scale-110 group-hover:opacity-80 transition-all ease-in-out object-center lg:h-full lg:w-full' />
                                <div className='absolute inset-x-4 top-32  overflow-hidden rounded-lg  '>
                                    <div className='w-fit ml-auto whitespace-nowrap'>
                                        {location.isactive && <p className='bg-primary text-xs font-medium p-2 px-4 md:px-4 md:py-2 mb-6 rounded-full md:font-semibold md:text-sm text-white'>{location.button_text}</p>}

                                        {!location.isactive && <p className='bg-green-500 text-xs font-medium p-2 px-4 md:px-4 md:py-2 mb-6 rounded-full md:font-semibold md:text-sm text-white'>{location.button_text}</p>}
                                    </div>
                                </div>
                            </div>
                            <p className='mt-2'>{location.location}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Available_Locations;
