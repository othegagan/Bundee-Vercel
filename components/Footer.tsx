import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import Logo from './landing_page/Logo';

const Footer = () => {
    return (
        <>
            <footer className='bg-gray-200 mt-auto'>
                <div className='max-w-7xl px-6 py-12 mx-auto'>
                    <div className='md:flex md:-mx-3 md:items-center md:justify-between'>
                        <h1 className='text-xl font-semibold tracking-tight text-gray-800 md:mx-3 xl:text-2xl '>Get the best driving experience with Bundee</h1>
                        <div className='mt-6 md:mx-3 shrink-0 md:mt-0 md:w-auto'></div>
                    </div>
                    <hr className='my-6 border-gray-200 md:my-10 ' />

                    <div className='grid  gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
                        <div>
                            <p className='font-semibold text-gray-800 '>Bundee</p>

                            <div className='flex flex-col items-start mt-5 space-y-2'>
                                <Link href='/privacy'>Privacy Policy</Link>
                                <Link href='/terms'>Terms of Use</Link>
                                <Link href='/faqs'>FAQ's</Link>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Available Locations</p>

                            <div className='flex flex-col items-start mt-5 space-y-2'>
                                <Link href='/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129'>Austin Texas</Link>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Upcoming Locations</p>

                            <div className='flex flex-col items-start mt-5 space-y-2'>
                                <Link href='/vehicles?city=Dallas,%20Texas,%20United%20States&latitude=-96.796856&longitude=32.776272'>Dallas,TX</Link>
                                <Link href="/vehicles?city=Houston,%20Texas,%20United%20States&latitude=-95.367697&longitude=29.758938'">Houston, TX</Link>
                                <Link href='/vehicles?city=San%20Antonio,%20Texas,%20United%20States&latitude=-98.495141&longitude=29.4246'>San Antonio, TX</Link>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Experiences</p>

                            <div className='flex flex-col items-start mt-5 space-y-2'>
                                <Link href='/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129'>Book a Vehicle</Link>

                                <a href='https://bundee-adminportal-qa.azurewebsites.net/' target='blank'>
                                    Became a Host
                                </a>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Contact Us</p>

                            <div className='flex flex-col items-start mt-5 space-y-2'>
                                {/* <Link href='mailto:support@mybundee.com'>Contact Support</Link> */}
                                <Link href='mailto:support@mybundee.com'>support@mybundee.com</Link>
                            </div>
                        </div>
                    </div>
                    <hr className='my-6 border-gray-200 md:my-10 ' />
                    <div className='flex flex-col items-center justify-between sm:flex-row'>
                        <Logo />

                        <p className='mt-4 text-sm text-gray-500 sm:mt-0 '>© Copyright 2023. MyBundee All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
