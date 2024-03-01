import Link from 'next/link';
import Logo from './landing_page/Logo';
import Container from './Container';

const Footer = () => {
    return (
        <>
            <footer className=' bg-black/10 mt-auto'>
                <Container>
                    <h1 className='  md:text-lg font-semibold tracking-tight text-gray-800 md:mx-3 xl:text-2xl '>
                        Get the best driving experience with Bundee
                    </h1>

                    <div className='grid  gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-4'>
                        <div>
                            <p className='font-semibold text-gray-800 '>Bundee</p>
                            <div className='flex flex-col items-start mt-2 md:mt-5 space-y-2 font-light md:font-normal'>
                                <Link href='/privacy'>Privacy Policy</Link>
                                <Link href='/terms'>Terms of Use</Link>
                                <Link href='/faqs'>FAQ's</Link>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Available Locations</p>
                            <div className='flex flex-col items-start mt-2 md:mt-5 space-y-2 font-light md:font-normal'>
                                <Link href='/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129'>Austin Texas</Link>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Upcoming Locations</p>

                            <div className='flex flex-col items-start mt-2 md:mt-5 space-y-2 font-light md:font-normal'>
                                <Link href='/vehicles?city=Dallas,%20Texas,%20United%20States&latitude=-96.796856&longitude=32.776272'>Dallas,TX</Link>
                                <Link href="/vehicles?city=Houston,%20Texas,%20United%20States&latitude=-95.367697&longitude=29.758938'">Houston, TX</Link>
                                <Link href='/vehicles?city=San%20Antonio,%20Texas,%20United%20States&latitude=-98.495141&longitude=29.4246'>San Antonio, TX</Link>
                            </div>
                        </div>

                        <div>
                            <p className='font-semibold text-gray-800 '>Experiences</p>

                            <div className='flex flex-col items-start mt-2 md:mt-5 space-y-2 font-light md:font-normal'>
                                <Link href='/vehicles?city=Austin,%20Texas,%20United%20States&latitude=-97.7437&longitude=30.271129'>Book a Vehicle</Link>

                                <a href='https://bundee-adminportal-qa.azurewebsites.net/' target='blank'>
                                    Became a Host
                                </a>
                            </div>
                        </div>

                        <div className=' hidden md:block'>
                            <p className='font-semibold text-gray-800 '>Contact Us</p>
                            <div className='flex flex-col items-start mt-2 md:mt-5 space-y-2 font-light md:font-normal'>
                                <Link href='mailto:support@mybundee.com' target='_blank'>
                                    support@mybundee.com
                                </Link>
                            </div>
                        </div>
                    </div>
                    <hr className='my-6 border-gray-500 md:my-10 ' />

                    <div className='hidden flex-col items-center justify-between sm:flex-row md:flex'>
                        <Logo />
                        <p className='mt-4 text-sm text-gray-500 sm:mt-0 '>© Copyright {new Date().getFullYear()}. MyBundee All Rights Reserved.</p>
                    </div>

                    {/* For Mobile */}
                    <div className='flex flex-row items-center justify-between  md:hidden'>
                        <Logo />
                        <Link href='mailto:support@mybundee.com' target='_blank'>
                            support@mybundee.com
                        </Link>
                    </div>
                    <p className='md:hidden mt-4 text-sm text-gray-500 sm:mt-0 text-center '>© Copyright {new Date().getFullYear()}. MyBundee All Rights Reserved.</p>
                </Container>
            </footer>
        </>
    );
};

export default Footer;
