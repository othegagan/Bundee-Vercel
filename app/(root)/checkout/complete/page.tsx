'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CompletePage() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success') === 'true';

    const router = useRouter();
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown === 0 && success) {
            router.push('/trips');
        } else if (countdown === 0 && !success) {
            router.push('/');
        }
    }, [countdown]);

    if (success) {
        return (
            <div className='my-6 flex min-h-[calc(75dvh-80px)] w-full items-center justify-center bg-white px-5 '>
                <div className='text-center'>
                    <div className='inline-flex rounded-full p-4'>
                        <img
                            className='h-[180px]'
                            src='https://img.freepik.com/free-vector/select-concept-illustration_114360-393.jpg?w=1380&t=st=1702901606~exp=1702902206~hmac=8c78eea564b8528b9d05cded445c80f54852f14bb16300315766d7b9a9ec31ce'
                            alt=''
                        />
                    </div>
                    <h1 className='mt-4 font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl'>
                        Reservation Request has <br className='md:hidden' /> been submitted
                    </h1>
                    <p className='lg-w-[600px] mx-auto mt-6 w-full text-base text-gray-600'>
                        You should hear back from your vehicle host shortly. <br className='hidden md:block' /> In addition, you can check your reservation
                        details by clicking on the trip status button below.
                    </p>
                    <div className='mt-10'>
                        <Link
                            className=' rounded-full bg-green-500 p-4 font-semibold text-sm text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2'
                            href='/trips'>
                            See Trip Status
                        </Link>
                    </div>

                    <p className='mt-10 font-semibold text-lg text-neutral-400'>
                        Redirecting to trips in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='my-6 flex min-h-[calc(75dvh-80px)] w-full items-center justify-center bg-white px-5 '>
            <div className='text-center'>
                <div className='inline-flex rounded-full p-4'>
                    <img
                        className='h-[180px]'
                        src='https://img.freepik.com/free-vector/select-concept-illustration_114360-393.jpg?w=1380&t=st=1702901606~exp=1702902206~hmac=8c78eea564b8528b9d05cded445c80f54852f14bb16300315766d7b9a9ec31ce'
                        alt=''
                    />
                </div>
                <h1 className='mt-4 font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl'>Oops something went wrong.</h1>
                <p className='lg-w-[600px] mx-auto mt-4 w-full text-base text-gray-600'>Please contact us if the problem persists.</p>

                <p className='mt-10 font-semibold text-lg text-neutral-400'>
                    Redirecting to home in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                </p>
            </div>
        </div>
    );
}
