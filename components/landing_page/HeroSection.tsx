'use client';

import Image from 'next/image';
import Container from '../BoxContainer';
import LocationSearchComponent from '../search_box/LocationSearchComponent';

const HeroSection = () => {
    return (
        <div className='relative'>
            <Image
                src='/images/hero.webp'
                width={0}
                height={0}
                sizes='100vw'
                style={{ width: '100%', height: '50dvh' }}
                alt='hero image'
                className='-z-10 absolute object-cover object-top opacity-95 bg-blend-lighten'
                priority
            />
            <section className=' h-[50dvh] py-16 sm:py-16 lg:py-24'>
                <Container>
                    <LocationSearchComponent />
                </Container>
            </section>
        </div>
    );
};

export default HeroSection;
