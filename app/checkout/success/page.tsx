'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccess() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prevCountdown => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            router.push('/trips');
        }
    }, [countdown]);

    return (
        <>
            <div className='my-20 flex h-[calc(75vh-80px)] w-full items-center justify-center bg-white p-5 md:my-0'>
                <div className='text-center'>
                    <div className='inline-flex rounded-full  p-4'>
                        <img
                            className='h-[180px]'
                            src='https://img.freepik.com/free-vector/select-concept-illustration_114360-393.jpg?w=1380&t=st=1702901606~exp=1702902206~hmac=8c78eea564b8528b9d05cded445c80f54852f14bb16300315766d7b9a9ec31ce'
                            alt=''
                        />
                    </div>
                    <h1 className='mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>Reservation Request has been submitted</h1>
                    <p className='lg-w-[600px] mx-auto  mt-6 w-full text-base text-gray-600'>
                        You should hear back from your vehicle host shortly. <br /> In addition, you can check your reservation details by clicking on the Trip
                        Status button below.
                    </p>
                    <div className='mt-10'>
                        <Link
                            className='ounded-md rounded-full bg-green-600 p-4 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                            href='/trips'>
                            See Trip Status
                        </Link>
                    </div>

                    <p className='mt-2 text-lg font-semibold text-neutral-600'>
                        Redirecting to trips  in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                    </p>
                </div>
            </div>
        </>
    );
}
