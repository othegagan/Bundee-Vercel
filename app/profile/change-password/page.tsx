'use client';

import { auth } from '@/app/auth/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserAuth } from '@/lib/authContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useEffect, useState } from 'react';

const ChangePassword = () => {
    const [error, setError] = useState('');
    const [errorOccuredInresetMailSent, setErrorOccuredInresetMailSent] = useState(false);
    const [resetMailSent, setResetEmailSent] = useState(false);

    const { user } = useUserAuth();

    const handleResetPassword = async resetemail => {
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
        if (email == '') {
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
        if (isValidEmail(user.email)) {
            await handleResetPassword(user.email);
        }
    };

    function refreshPageHandler() {
        setErrorOccuredInresetMailSent(false);
        window.location.href = '/auth/login';
    }

    return (
        <div className='h-screen flex w-ful justify-start mt-12'>
            {errorOccuredInresetMailSent == false && !resetMailSent && (
                <div className='w-full'>
                    <div className='mt-10'>
                        <div className='w-full'>
                            <label className='text-sm font-medium leading-6 text-gray-900'>Email address</label>
                            <div className='mt-2'>
                                <Input id='email' name='email' type='email' required value={user?.email} disabled className='' />
                            </div>
                        </div>
                        {error && <p className='mt-2 text-red-500 text-sm'>{error}</p>}

                        <div className='flex justify-end'>
                            <Button onClick={firebasereestPasswordHandler} variant='outline' className='my-5'>
                                Get Password Reset link
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {errorOccuredInresetMailSent == true && !resetMailSent && (
                <div className='w-full'>
                    <div className='w-full'>
                        <h2 className='mt-10 text-left text-2xl font-bold leading-9 tracking-tight text-gray-900'>Something went wrong.</h2>
                        <p className=' mt-4 text-left text-gray-600'>We have encounter some prblem reseting your password, please try again</p>
                    </div>

                    <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
                        <div>
                            <Button onClick={refreshPageHandler} className='mt-8 flex w-full justify-center'>
                                Try again
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {resetMailSent == true && (
                <div>
                    <div className='flex flex-col justify-start sm:mx-auto sm:w-full sm:max-w-sm'>
                        <p className='mt-4 text-left text-gray-600'>
                            An Email containing the password reset link has been shared to your email <span className='font-bold'>{user?.email}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePassword;
