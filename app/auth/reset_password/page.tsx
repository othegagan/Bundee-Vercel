"use client"

import React, { useEffect, useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';

const LoginPage = () => {


    const [resetemail, setResetEmail] = useState('');
    const [error, setError] = useState('');
    const [errorOccuredInresetMailSent, setErrorOccuredInresetMailSent] = useState(false);
    const [resetMailSent, setResetEmailSent] = useState(false);



    useEffect(() => {

        const auth_token = localStorage.getItem("auth_token");
        const sessionUser = localStorage.getItem("session_user");
        const emailVeirfyStatus = localStorage.getItem("email_verify_status");


    }, []);

    const handleResetPassword = async (resetemail) => {

        try {
            await sendPasswordResetEmail(auth, resetemail);
            // alert("Password reset email sent! Check your inbox.");
            setErrorOccuredInresetMailSent(false);
            setResetEmailSent(true);
        } catch (error) {
            console.error("Error sending password reset email:", error);
            setError("Failed to send password reset email. Please try again.");
            setErrorOccuredInresetMailSent(true);
        }
    };


    function isValidEmail(email) {

        if (email == "") {
            setError("Email can not be empty");
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            setError("Invalid email format, correct Your email");
            return false;
        }

        return true;
    }


    function handleOnchangeEmail(value) {
        setResetEmail(value);
    }


    const firebasereestPasswordHandler = async () => {
        if (isValidEmail(resetemail)) {
            await handleResetPassword(resetemail);
        }
    }

    function refreshPageHandler() {
        setErrorOccuredInresetMailSent(false);
        window.location.href = "/auth/login";

    }

    return (
        <div className='h-screen flex justify-center'>
            {(errorOccuredInresetMailSent == false && !resetMailSent) && (
                <div className='shadow-sm h-[400px] w-[600px] lg:h-[400px] lg:w-[600px] md:h-[400px] md:w-[348px] sm:h-[400px] sm:w-[348px] bg-white min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
                    <div className='flex flex-col justify-start sm:mx-auto sm:w-full sm:max-w-sm'>
                        <h2 className='mt-10 text-left text-2xl font-bold leading-9 tracking-tight text-gray-900'>
                            Enter email address
                        </h2>
                        <p className=' mt-4 text-left text-gray-600'>A password reset link will be shared to the email address you entered.</p>
                    </div>

                    <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
                        <div>
                            <label className='block text-sm font-medium leading-6 text-gray-900'>Email address</label>
                            <div className='mt-2'>
                                <Input
                                    id='email'
                                    name='email'
                                    type='email'
                                    required
                                    value={resetemail}
                                    onChange={(e) => handleOnchangeEmail(e.target.value)}
                                    className='block w-full'
                                />
                            </div>
                        </div>

                        <div>
                            <Button onClick={firebasereestPasswordHandler} className='mt-8 flex w-full justify-center'>
                                Get Password verification link
                            </Button>
                        </div>
                        {error && <p className='mt-2 text-red-500 text-sm text-center'>{error}</p>}
                    </div>
                </div>
            )}

            {(errorOccuredInresetMailSent == true && !resetMailSent) && (
                <div className='shadow-sm h-[400px] w-[600px] lg:h-[400px] lg:w-[600px] md:h-[400px] md:w-[348px] sm:h-[400px] sm:w-[348px] bg-white min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
                    <div className='flex flex-col justify-start sm:mx-auto sm:w-full sm:max-w-sm'>
                        <h2 className='mt-10 text-left text-2xl font-bold leading-9 tracking-tight text-gray-900'>
                            Something went wrong.
                        </h2>
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
                <div className='shadow-sm h-[400px] w-[600px] lg:h-[400px] lg:w-[600px] md:h-[400px] md:w-[348px] sm:h-[400px] sm:w-[348px] bg-white min-h-full flex-col justify-center px-6 py-12 lg:px-8'>
                    <div className='flex flex-col justify-start sm:mx-auto sm:w-full sm:max-w-sm'>
                        <h2 className='mt-10 text-left text-2xl font-bold leading-9 tracking-tight text-gray-900'>
                            Password Reset
                        </h2>
                        <p className='mt-4 text-left text-gray-600'>
                            An Email containing the password reset link has been shared to your email {resetemail}
                        </p>

                    </div>

                    <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
                        <div>
                            
                            <Button onClick={refreshPageHandler} className='mt-8 flex w-full justify-center'>
                                Back to Login
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
