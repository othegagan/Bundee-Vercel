'use client';

import Link from 'next/link';
import Container from './BoxContainer';
import { HideComponent } from './custom/HideWrapper';
import Logo from './landing_page/Logo';

const Footer = () => {
    return (
        <HideComponent>
            <footer className=' mt-auto hidden bg-black/10 md:block'>
                <Container className='p-4'>
                    <div className=' grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-5'>
                        <div>
                            <p className='font-semibold text-gray-800 '>MyBundee</p>
                            <div className='mt-2 flex flex-col items-start space-y-2 font-light  md:font-normal'>
                                <p>
                                    <Link href='/privacy'>Privacy Policy</Link>
                                </p>
                                <p>
                                    <Link href='/terms'>Terms of Use</Link>
                                </p>
                                <p>
                                    <Link href='/#faqs'>FAQ's</Link>
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Available Locations</p>
                            <div className='mt-2 flex flex-col items-start space-y-2 font-light  md:font-normal'>
                                <p>
                                    <Link href='/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129'>
                                        Austin Texas
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Upcoming Locations</p>

                            <div className='mt-2 flex flex-col items-start space-y-2 font-light  md:font-normal'>
                                <p>
                                    <Link href='/vehicles?city=Dallas,%20Texas,%20United%20States&latitude=-96.796856&longitude=32.776272'>
                                        Dallas,TX
                                    </Link>
                                </p>
                                <p>
                                    <Link href="/vehicles?city=Houston,%20Texas,%20United%20States&latitude=-95.367697&longitude=29.758938'">
                                        Houston, TX
                                    </Link>
                                </p>
                                <p>
                                    <Link href='/vehicles?city=San%20Antonio,%20Texas,%20United%20States&latitude=-98.495141&longitude=29.4246'>
                                        San Antonio, TX
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Experiences</p>

                            <div className='mt-2 flex flex-col items-start space-y-2 font-light  md:font-normal'>
                                <p>
                                    <Link href='/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129'>
                                        Book a Vehicle
                                    </Link>
                                </p>

                                <p>
                                    <Link href='https://bundee-adminportal-qa.azurewebsites.net/' target='blank'>
                                        Became a Host
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className=' hidden md:block'>
                            <p className='font-semibold text-gray-800 '>Contact Us</p>
                            <div className='mt-2 flex flex-col items-start space-y-2 font-light  md:font-normal'>
                                <p>
                                    <Link href='mailto:support@mybundee.com' target='_blank'>
                                        support@mybundee.com
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                    <hr className='my-4 border-gray-500  ' />

                    <div className='hidden flex-col items-center justify-between sm:flex-row md:flex'>
                        <Logo />
                        <p className='mt-4 text-sm text-gray-500 sm:mt-0 '>
                            © Copyright {new Date().getFullYear()}. MyBundee All Rights Reserved.
                        </p>
                    </div>

                    {/* For Mobile */}
                    <div className='flex flex-row items-center justify-between  md:hidden'>
                        <Logo />
                        <Link href='mailto:support@mybundee.com' target='_blank'>
                            support@mybundee.com
                        </Link>
                    </div>
                    <p className='mt-4 text-center text-sm text-gray-500 sm:mt-0 md:hidden '>
                        © Copyright {new Date().getFullYear()}. MyBundee All Rights Reserved.
                    </p>
                </Container>
            </footer>

            <footer className='mt-auto bg-black/10 pb-6 md:hidden '>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className=' pt-8'>
                        <div className='mx-auto flex  max-w-7xl flex-col px-4 xl:flex-row xl:justify-between'>
                            <div className='flex justify-center  xl:items-center xl:justify-start'>
                                <Logo />
                            </div>
                            <div className='mt-8 items-center xl:mt-0 xl:flex xl:justify-end xl:space-x-8'>
                                <ul className='flex flex-wrap items-center justify-center gap-x-8 gap-y-3 xl:justify-end'>
                                    <li>
                                        <p className='font-medium'>
                                            <Link href='/'>Home</Link>
                                        </p>
                                    </li>
                                    <li>
                                        <p className='font-medium'>
                                            <Link href='/privacy'>Privacy Policy</Link>
                                        </p>
                                    </li>
                                    <li>
                                        <p className='font-medium'>
                                            <Link href='/terms'>Terms of Use</Link>
                                        </p>
                                    </li>
                                    <li>
                                        <p className='font-medium'>
                                            <Link href='/#faqs'>FAQ's</Link>
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <hr className='my-4  border-zinc-700' />
                    <div className='space-y-5 text-center sm:flex sm:items-center sm:justify-between'>
                        <Link className='text-sm text-zinc-800 no-underline' href='mailto: support@mybundee.com'>
                            support@mybundee.com
                        </Link>
                        <p className='text-sm text-zinc-800'> © Copyright {new Date().getFullYear()}. MyBundee All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </HideComponent>
    );
};

export default Footer;
