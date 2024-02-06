"use client"

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Banner = () => {
    return (
        <>
            <section className='mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8 w-full '>
                <div className='px-4 mx-auto overflow-hidden bg-gray-100 rounded-lg sm:rounded-3xl max-w-7xl sm:px-6 lg:px-8'>
                    <div className='py-10 sm:py-16 lg:py-24 2xl:pl-24'>
                        <div className='grid items-center grid-cols-1 gap-y-12 lg:grid-cols-2 lg:gap-x-8 2xl:gap-x-20'>
                            <div>
                                <h2 className='text-3xl font-bold leading-tight  sm:text-4xl lg:text-5xl lg:leading-tight'>Drive like a local</h2>
                                <p className='mt-4 text-base '>Step into the world of Bundee, where you can discover a diverse range of vehicles tailored to your interests. Embark on a journey to explore and experience your dream destinations.</p>

                                {/* <div className='flex flex-row items-center mt-8 space-x-4 lg:mt-12'>

                                    <Link href='/downloads' className='text-sm font-semibold leading-6 text-foreground underline-offset-2 bg-primary p-4 rounded-full text-white px-8'>
                                        Download App Now
                                    </Link>

                                </div> */}

                                <div className='mt-8 flex flex-row items-center space-x-4 lg:mt-12'>
                                    <Link href='https://apps.apple.com/in/app/mybundee/id6451430817' title='' className='flex' role='button'>
                                        <Image
                                            width={200}
                                            height={200}
                                            src='/btn-app-store.svg'
                                            alt=''
                                        />
                                    </Link>

                                    <Link href='https://play.google.com/store/apps/details?id=com.bundee_mobile_app' title='' className='flex' role='button'>
                                        <Image
                                            width={200}
                                            height={200}
                                            className='object-cover'
                                            src='/btn-play-store.svg'
                                            alt=''
                                        />
                                    </Link>
                                </div>
                            </div>

                            <div className='relative '>
                                <img className='relative w-full max-w-lg mx-auto  ' src='./banner-circle.png' alt='App screenshot' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Banner;
