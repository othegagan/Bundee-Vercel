'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Failure() {
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
            router.push('/');
        }
    }, [countdown]);

    return (
        <div className='flex h-[calc(75vh-80px)] w-full items-center justify-center bg-white p-5'>
            <div className='text-center'>
                <div className='inline-flex rounded-full p-4'>
                    <img
                        className='h-[180px]'
                        src='https://img.freepik.com/free-vector/select-concept-illustration_114360-393.jpg?w=1380&t=st=1702901606~exp=1702902206~hmac=8c78eea564b8528b9d05cded445c80f54852f14bb16300315766d7b9a9ec31ce'
                        alt=''
                    />
                </div>
                <p className='mt-5 text-lg font-semibold text-neutral-800 md:text-2xl'>Oops something went wrong.</p>
                <p className='mt-2 text-lg font-semibold text-neutral-600'>
                    Redirecting to home in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                </p>
                <p>Please contact us if the problem persists.</p>
            </div>
        </div>
    );
}
