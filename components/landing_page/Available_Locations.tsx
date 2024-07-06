'use client';

import Image from 'next/image';
import Link from 'next/link';
import BoxContainer from '../BoxContainer';

const locations = [
    {
        id: 1,
        isactive: true,
        location: 'Austin,Texas,USA',
        disabled: false,
        button_text: 'Search Now',
        imageUrl:
            'https://images.unsplash.com/photo-1531218150217-54595bc2b934?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXVzdGluJTIwdGV4YXN8ZW58MHx8MHx8fDA%3D',
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
        imageUrl:
            'https://media.istockphoto.com/id/1004243142/photo/houston-texas-usa-skyline.jpg?s=612x612&w=0&k=20&c=SCMdgr9vKLgUVK7LPDN-PXkz5SAKdrQac97tYFQCEGY=',
        link: '/vehicles?city=Houston,%20Texas,%20United%20States&latitude=-95.367697&longitude=29.758938',
    },
    {
        id: 4,
        isactive: false,
        location: 'San Antonio, Texas, USA',
        disabled: true,
        button_text: 'Coming Soon',
        imageUrl:
            'https://media.istockphoto.com/id/1292013336/photo/river-walk-in-san-antonio-city-downtown-skyline-cityscape-of-texas-usa.jpg?s=612x612&w=0&k=20&c=FnzOc9hVq6aNpE7450iIRYYbKpJqDdE4hbY78SKgUY8=',
        link: '/vehicles?city=San%20Antonio,%20Texas,%20United%20States&latitude=-98.495141&longitude=29.4246',
    },
];

const Available_Locations = () => {
    return (
        <>
            <BoxContainer className='py-6'>
                <div className='flex justify-between'>
                    <h3>Available Locations</h3>
                </div>

                <div className='mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
                    {locations.map((location) => (
                        <Link href={location.link} className='group relative cursor-pointer' key={location.id}>
                            <div className='aspect-video h-44 w-full overflow-hidden rounded-md bg-neutral-200 shadow-md lg:aspect-square'>
                                <Image
                                    src={location.imageUrl}
                                    alt={location.location}
                                    width={0}
                                    height={0}
                                    sizes='100vw'
                                    style={{ width: '100%', height: '100%' }}
                                    className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-110 group-hover:opacity-80 lg:h-full lg:w-full'
                                />
                                <div className='absolute inset-x-4 top-32  overflow-hidden rounded-lg  '>
                                    <div className='ml-auto w-fit whitespace-nowrap'>
                                        {location.isactive && (
                                            <p className='mb-6 rounded-full bg-primary p-2 px-4 text-xs font-medium text-white md:px-4 md:py-2 md:text-sm md:font-semibold'>
                                                {location.button_text}
                                            </p>
                                        )}

                                        {!location.isactive && (
                                            <p className='mb-6 rounded-full bg-green-500 p-2 px-4 text-xs font-medium text-white md:px-4 md:py-2 md:text-sm md:font-semibold'>
                                                {location.button_text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className='mt-2'>{location.location}</p>
                        </Link>
                    ))}
                </div>
            </BoxContainer>
        </>
    );
};

export default Available_Locations;
