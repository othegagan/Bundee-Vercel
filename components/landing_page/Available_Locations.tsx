'use client';

import Image from 'next/image';
import Link from 'next/link';
import BoxContainer from '../BoxContainer';

const locations = [
    {
        id: 1,
        isactive: true,
        location: 'Austin, Texas',
        disabled: false,
        button_text: 'Search Now',
        imageUrl:
            'https://images.unsplash.com/photo-1531218150217-54595bc2b934?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXVzdGluJTIwdGV4YXN8ZW58MHx8MHx8fDA%3D',
        link: '/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129'
    },
    {
        id: 2,
        isactive: false,
        location: 'Dallas, Texas',
        disabled: false,
        button_text: 'Coming Soon',
        imageUrl: 'https://www.tshaonline.org/images/handbook/entries/DD/dallas_skyline.jpg',
        link: '/vehicles?city=Dallas,%20Texas,%20United%20States&latitude=-96.796856&longitude=32.776272'
    },
    {
        id: 3,
        isactive: false,
        location: 'Houston, Texas',
        disabled: false,
        button_text: 'Coming Soon',
        imageUrl:
            'https://media.istockphoto.com/id/1004243142/photo/houston-texas-usa-skyline.jpg?s=612x612&w=0&k=20&c=SCMdgr9vKLgUVK7LPDN-PXkz5SAKdrQac97tYFQCEGY=',
        link: '/vehicles?city=Houston,%20Texas,%20United%20States&latitude=-95.367697&longitude=29.758938'
    },
    {
        id: 4,
        isactive: false,
        location: 'San Antonio, Texas',
        disabled: false,
        button_text: 'Coming Soon',
        imageUrl:
            'https://media.istockphoto.com/id/1292013336/photo/river-walk-in-san-antonio-city-downtown-skyline-cityscape-of-texas-usa.jpg?s=612x612&w=0&k=20&c=FnzOc9hVq6aNpE7450iIRYYbKpJqDdE4hbY78SKgUY8=',
        link: '/vehicles?city=San%20Antonio,%20Texas,%20United%20States&latitude=-98.495141&longitude=29.4246'
    }
];

export default function Available_Locations() {
    return (
        <BoxContainer className='space-y-3 py-6'>
            <h2 className='m\b-4 font-bold text-2xl'>Search by City</h2>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-4'>
                {locations.map((location) => (
                    <Link href={location.link} className='group relative cursor-pointer overflow-hidden rounded-md' key={location.id}>
                        <div className='aspect-video h-44 w-full bg-neutral-200 shadow-md lg:aspect-square'>
                            <Image
                                src={location.imageUrl}
                                alt={location.location}
                                fill
                                className='transition-all ease-in-out group-hover:scale-110 group-hover:opacity-80'
                            />
                            <div className='absolute inset-0 flex flex-col justify-between p-4'>
                                <div className='self-end'>
                                    {location.isactive ? (
                                        <span className='rounded-full bg-primary px-3 py-1 font-semibold text-white text-xs'>{location.button_text}</span>
                                    ) : (
                                        <span className='rounded-full bg-primary/70 px-3 py-1 font-semibold text-white text-xs'>{location.button_text}</span>
                                    )}
                                </div>
                                <div className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4'>
                                    <h3 className='font-semibold text-lg text-white'>{location.location}</h3>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </BoxContainer>
    );
}
