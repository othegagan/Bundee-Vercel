'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Failure() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            router.push('/');
        }
    }, [countdown]);

    return (
        <div className='my-6 flex min-h-[calc(75dvh-80px)] w-full items-center justify-center bg-white px-5 '>
            <div className='text-center'>
                <div className='inline-flex rounded-full  p-4'>
                    <img
                        className='h-[180px]'
                        src='https://img.freepik.com/free-vector/select-concept-illustration_114360-393.jpg?w=1380&t=st=1702901606~exp=1702902206~hmac=8c78eea564b8528b9d05cded445c80f54852f14bb16300315766d7b9a9ec31ce'
                        alt=''
                    />
                </div>
                <h1 className='mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>Oops something went wrong.</h1>
                <p className='lg-w-[600px] mx-auto  mt-4 w-full text-base text-gray-600'>Please contact us if the problem persists.</p>

                <p className='mt-10 text-lg font-semibold text-neutral-400'>
                    Redirecting to home in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                </p>
            </div>
        </div>
    );
}
