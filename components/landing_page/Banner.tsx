import Image from 'next/image';
import Link from 'next/link';
import BoxContainer from '../BoxContainer';

const Banner = () => {
    return (
        <>
            <BoxContainer className=' my-4'>
                <div className='mx-auto max-w-7xl overflow-hidden rounded-lg bg-gray-100 px-4 sm:rounded-3xl sm:px-6 lg:px-8'>
                    <div className='py-10 sm:py-16 lg:py-24 2xl:pl-24'>
                        <div className='grid grid-cols-1 items-center gap-y-12 lg:grid-cols-2 lg:gap-x-8 2xl:gap-x-20'>
                            <div>
                                <h2 className='text-3xl font-bold leading-tight  sm:text-4xl lg:text-5xl lg:leading-tight'>Drive like a local</h2>
                                <p className='mt-4 text-base '>
                                    Step into the world of MyBundee, where you can discover a diverse range of vehicles tailored to your interests. Embark on a
                                    journey to explore and experience your dream destinations.
                                </p>

                                <div className='mt-8 flex flex-row items-center space-x-4 lg:mt-12'>
                                    <Link href='https://apps.apple.com/app/mybundee/id6451430817' className='flex' role='button'>
                                        <Image width={200} height={200} className='h-auto w-auto object-cover' src='/icons/btn-app-store.svg' alt='' />
                                    </Link>

                                    <Link href='https://play.google.com/store/apps/details?id=com.bundee_mobile_app' className='flex' role='button'>
                                        <Image width={200} height={200} className='h-auto w-auto object-cover' src='/icons/btn-play-store.svg' alt='' />
                                    </Link>
                                </div>
                            </div>

                            <div className='relative '>
                                <img className='relative mx-auto w-full max-w-lg  ' src='./images/banner-circle.png' alt='App screenshot' />
                            </div>
                        </div>
                    </div>
                </div>
            </BoxContainer>
        </>
    );
};

export default Banner;
