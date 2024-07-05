import Image from 'next/image';
import BoxContainer from '../BoxContainer';

export default function BundeeBranding() {
    return (
        <BoxContainer className='py-6 md:py-10'>
            <div className='grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2'>
                <div className='flex flex-col gap-3'>
                    <h2 className='tracking-tight font-bold'>
                        Fiat Electric <br /> Collection: Drive <span className='text-green-500'>Green</span>
                    </h2>
                    <p>
                        Experience eco-friendly travel with Fiat's Electric Collection. <br /> Rent sustainable, high-performance electric vehicles and
                        contribute to a cleaner environment. Join the green revolution with every journey.
                    </p>
                </div>

                <div className=' flex flex-row sm:flex-wrap '>
                    <div className='flex w-full flex-row-reverse flex-wrap sm:w-1/2 lg:flex-row'>
                        <div className='w-full p-1  lg:w-1/2'>
                            <Image
                                alt='gallery'
                                width={0}
                                height={0}
                                sizes='100vw'
                                priority
                                style={{ width: '100%', height: '100%' }}
                                className='block h-full w-full rounded-lg object-cover object-center '
                                src='https://fiat.b-cdn.net/FT623338.jpeg'
                            />
                        </div>
                        <div className='w-full p-1  lg:w-1/2'>
                            <Image
                                alt='gallery'
                                width={0}
                                height={0}
                                sizes='100vw'
                                priority
                                style={{ width: '100%', height: '100%' }}
                                className='block h-full w-full rounded-lg object-cover object-center '
                                src='https://23820752.fs1.hubspotusercontent-na1.net/hub/23820752/hubfs/EV%20gallery2.png?width=1320&height=1200&name=EV%20gallery2.png'
                            />
                        </div>
                        <div className='w-full p-1 '>
                            <Image
                                alt='gallery'
                                width={0}
                                height={0}
                                sizes='100vw'
                                priority
                                style={{ width: '100%', height: '100%' }}
                                className='block h-full max-h-none w-full rounded-lg object-cover object-center lg:max-h-[1000px] '
                                src='https://fiat.b-cdn.net/HT526227.jpeg'
                            />
                        </div>
                    </div>
                    <div className='flex w-full flex-wrap sm:w-1/2'>
                        <div className='w-full p-1 '>
                            <Image
                                alt='gallery'
                                width={0}
                                height={0}
                                sizes='100vw'
                                priority
                                style={{ width: '100%', height: '100%' }}
                                className='block h-full w-full rounded-lg object-cover object-center '
                                src='https://fiat.b-cdn.net/GT121992.jpeg'
                            />
                        </div>
                        <div className='w-1/2 p-1 '>
                            <Image
                                alt='gallery'
                                width={0}
                                height={0}
                                sizes='100vw'
                                priority
                                style={{ width: '100%', height: '100%' }}
                                className='block h-full w-full rounded-lg object-cover object-center '
                                src='https://23820752.fs1.hubspotusercontent-na1.net/hub/23820752/hubfs/NEV%20gallery3.png?width=1320&height=1200&name=NEV%20gallery2.png'
                            />
                        </div>
                        <div className='w-1/2 p-1 '>
                            <Image
                                alt='gallery'
                                width={0}
                                height={0}
                                sizes='100vw'
                                priority
                                style={{ width: '100%', height: '100%' }}
                                className='block h-full w-full rounded-lg object-cover object-center '
                                src='https://23820752.fs1.hubspotusercontent-na1.net/hub/23820752/hubfs/NEV%20gallery2.png?width=1320&height=1200&name=NEV%20gallery2.png'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </BoxContainer>
    );
}
