'use client';

import Image from 'next/image';
import Container from '../BoxContainer';
import LocationSearchComponent from '../search_box/LocationSearchComponent';

const HeroSeaction = () => {
    return (
        <div className='relative'>
            <Image
                src='/hero.webp'
                width={0}
                height={0}
                sizes='100vw'
                style={{ width: '100%', height: '70vh' }} 
                alt='hero image'
                className='bg-blend-lighten object-fill opacity-95 absolute -z-10 object-center'
            />
            <section className='  h-[70vh]    py-16  sm:py-16 lg:py-24'>
                <Container>
                    <LocationSearchComponent />
                </Container>
            </section>
        </div>
    );
};

export default HeroSeaction;
