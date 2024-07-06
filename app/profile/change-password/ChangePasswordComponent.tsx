'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSession } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useEffect, useState } from 'react';

const ChangePasswordComponent = () => {
    const [error, setError] = useState('');
    const [errorOccuredInresetMailSent, setErrorOccuredInresetMailSent] = useState(false);
    const [resetMailSent, setResetEmailSent] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const session = await getSession();
            setEmail(session.email);
        };

        fetchData();
    }, []);

    const handleResetPassword = async (resetemail) => {
        try {
            await sendPasswordResetEmail(auth, resetemail);
            // alert("Password reset email sent! Check your inbox.");
            setErrorOccuredInresetMailSent(false);
            setResetEmailSent(true);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            setError('Failed to send password reset email. Please try again.');
            setErrorOccuredInresetMailSent(true);
        }
    };

    function isValidEmail(email) {
        if (email === '') {
            setError('Email can not be empty');
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            setError('Invalid email format, correct Your email');
            return false;
        }

        return true;
    }

    const firebasereestPasswordHandler = async () => {
        const session = await getSession();
        if (isValidEmail(session.email)) {
            await handleResetPassword(session.email);
        }
    };

    return (
        <div className='w-ful mt-12 flex h-screen justify-start'>
            {errorOccuredInresetMailSent === false && !resetMailSent && (
                <div className='w-full'>
                    <div className='mt-10'>
                        <div className='w-full'>
                            <label className='text-sm font-medium leading-6 text-gray-900'>Email address</label>
                            <div className='mt-2'>
                                <Input id='email' name='email' type='email' required value={email} disabled className='' />
                            </div>
                        </div>
                        {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}

                        <div className='flex justify-end'>
                            <Button onClick={firebasereestPasswordHandler} variant='black' className='my-5'>
                                Get Password Reset link
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {errorOccuredInresetMailSent === true && !resetMailSent && (
                <div className='w-full'>
                    <h2 className='mt-10 text-left text-2xl font-bold leading-9 tracking-tight text-gray-900'>Something went wrong.</h2>
                    <p className=' mt-4 text-left text-gray-600'>We have encounter some problem resting your password, please try again</p>
                </div>
            )}

            {resetMailSent === true && (
                <div>
                    <div className='flex flex-col justify-start sm:mx-auto sm:w-full sm:max-w-sm'>
                        <p>
                            An Email containing the password reset link has been shared to your email <span className='font-bold'>{email}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePasswordComponent;
