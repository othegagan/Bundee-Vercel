'use client';

import { useState, useEffect, use } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoWarning } from 'react-icons/io5';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { getUserByEmail } from '@/app/_actions/getUserByEmail';
import { initializeAuthTokensAfterLogin } from '@/app/_actions/get_after_login_auth_token';
import Logo from '@/components/landing_page/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuLoader2 } from 'react-icons/lu';
import { auth } from '../firebase';
import ClientOnly from '@/components/ClientOnly';
import { useUserAuth } from '@/lib/authContext';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [callbackUrl, setCallbackUrl] = useState('/');

    const { googleSignIn } = useUserAuth();

    useEffect(() => {
        const sessionUser = localStorage.getItem('session_user');
        if (sessionUser) {
            window.location.replace('/');
        }
        setCallbackUrl(localStorage.getItem('authCallbackSuccessUrl'));
    }, []);

    const handleLogin = async event => {
        event.preventDefault();
        setAuthError('');

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            const user = userCredential.user;
            const firebaseToken = await user.getIdToken();

            if (user.emailVerified) {
                const tokenAfterLogin = await initializeAuthTokensAfterLogin(firebaseToken);
                localStorage.setItem('auth_token_login', tokenAfterLogin);

                const bundeeAuthToken = localStorage.getItem('bundee_auth_token');
                const { errorcode, userData } = await getUserByEmail(user.email, bundeeAuthToken);

                if (errorcode == '1') {
                    throw new Error(errorcode);
                } else {
                    localStorage.setItem('session_user', userData?.email || '');
                    localStorage.setItem('userId', userData.iduser);
                }

                setLoading(false);
                if (callbackUrl && callbackUrl.includes('/auth/signup')) {
                    window.location.replace('/');
                } else {
                    window.location.replace(callbackUrl || '/');
                }
            } else {
                setAuthError('Please Verify Your Email.');
            }
        } catch (error) {
            // console.log(error);
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = error => {
        const errorMap = {
            'auth/user-not-found': 'User account not found.',
            'auth/wrong-password': 'Incorrect password. Try again.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many requests. Please try again later.',
            'auth/user-disabled': 'Account has been disabled.',
            'auth/missing-password': 'Please enter your password.',
            'auth/invalid-credential': 'Invailid Credentials. Please try again.',
            default: 'An error occurred. Please try again.',
        };

        setAuthError(errorMap[error.code] || errorMap.default);
    };

    return (
        <>
            <ClientOnly>
                <div className='flex px-6  mt-12 mb-10  '>
                    <div className='flex-1 h-full max-w-5xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl '>
                        <div className='flex flex-col overflow-y-auto md:flex-row'>
                            <div className='h-32 md:h-auto md:w-1/2'>
                                <img
                                    aria-hidden='true'
                                    className='object-cover w-full h-full dark:hidden'
                                    src='https://static.toiimg.com/thumb/resizemode-4,width-1200,height-900,msid-80750857/80750857.jpg'
                                    alt='light'
                                />
                            </div>
                            <main className='flex items-center justify-center p-6 sm:p-12 md:w-1/2 '>
                                <div className='w-full'>
                                    <div className='flex flex-col items-center gap-4'>
                                        <Logo />

                                        <span className='mb-4 ml-4 text-xl font-semibold text-neutral-700 '>Login for your account</span>
                                    </div>
                                    <form
                                        onSubmit={event => {
                                            event.preventDefault(); // Prevents the default form submission behavior
                                            handleLogin(event);
                                        }}>
                                        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                                            Email address
                                        </label>
                                        <div className='mt-1'>
                                            <Input
                                                id='email'
                                                name='email'
                                                type='email'
                                                autoComplete='email'
                                                required
                                                value={userEmail}
                                                onChange={e => setUserEmail(e.target.value)}
                                            />
                                        </div>
                                        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mt-4'>
                                            Password
                                        </label>
                                        <div className='relative'>
                                            <div
                                                onClick={() => {
                                                    setShowPassword(!showPassword);
                                                }}
                                                className='cursor-pointer text-xs p-2 absolute top-1 right-2'>
                                                {showPassword == true ? <FaEye /> : <FaEyeSlash />}
                                            </div>
                                            <div className='mt-1'>
                                                <Input
                                                    id='password'
                                                    name='password'
                                                    type={showPassword == true ? 'password' : 'text'}
                                                    autoComplete='current-password'
                                                    required
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {authError ? (
                                            <div className='my-3 rounded-md bg-red-50 p-3 select-none'>
                                                <div className='flex'>
                                                    <div className='flex-shrink-0'>
                                                        <IoWarning className='h-5 w-5 text-red-400' />
                                                    </div>
                                                    <div className='ml-3'>
                                                        <p className='text-sm font-medium text-red-800'>{authError}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className='mt-4'>
                                            <Button disabled={loading} className='w-full' type='submit'>
                                                {loading ? <LuLoader2 className='w-5 h-5 text-white animate-spin' /> : <p>Log in</p>}
                                            </Button>
                                        </div>
                                    </form>

                                    <hr className='my-4' />
                                    <Button
                                        onClick={() => {
                                            googleSignIn();
                                        }}
                                        variant='outline'
                                        className='w-full py-5 flex  gap-4'>
                                        <img className='w-5 h-5' src='https://www.svgrepo.com/show/475656/google-color.svg' loading='lazy' alt='google logo' />
                                        <span>Continue with Google</span>
                                    </Button>

                                    <div className='flex flex-col gap-2 mt-4'>
                                        <Link className='text-sm font-medium text-primary hover:underline w-fit' href='/auth/reset_password'>
                                            Forgot your password?
                                        </Link>

                                        <p className='mt-1 text-base'>
                                            Don't have an account?
                                            <Link className='text-base mx-1 font-medium text-primary  hover:underline' href='/auth/signup'>
                                                Sign up
                                            </Link>
                                            here
                                        </p>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </ClientOnly>
        </>
    );
};

export default LoginPage;
