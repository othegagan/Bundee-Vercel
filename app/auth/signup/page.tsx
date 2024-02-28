'use client';

import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LuLoader2 } from 'react-icons/lu';
import Logo from '@/components/landing_page/Logo';
import { createNewUser } from '@/app/_actions/create_new_user';
import { IoWarning } from 'react-icons/io5';
import { useUserAuth } from '@/lib/authContext';

const Signup = () => {
    const { googleSignIn } = useUserAuth();
    useEffect(() => {
        const sessionUser = localStorage.getItem('session_user');
        if (sessionUser) {
            window.location.replace('/');
        }
    }, []);

    const [sp, ssp] = useState(true);
    const [scp, sscp] = useState(true);
    const [agree, setAgree] = useState(false);
    const [agreeError, setAgreeError] = useState(false);

    const notify = () => toast('Registeration successfull, Redirecting to Login..');
    const [firebaseError, setFirebaseError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [authErrors, setAuthErrors] = useState({
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });
    const [redirect, setRedirect] = useState(false);

    const handleChange = e => {
        const { name, value } = e.target;

        setAuthErrors(prevErrors => ({
            ...prevErrors,
            [name]: '',
        }));

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (redirect) {
            notify();
            setTimeout(() => {
                window.location.href = '/auth/verification';
            }, 100);
        }
    }, [redirect]);

    function isValidEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    const isValidEmailAndPassword = () => {
        const { email, password, confirmPassword, phoneNumber, firstName, lastName } = formData;
        const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:;<>,.?~\\[\]-]).{8,}$/;
        const phoneNumberPattern = /^\d{10}$/;
        const namePattern = /^[a-zA-Z\s]+$/;

        // Validate first name
        if (!namePattern.test(firstName)) {
            setAuthErrors({
                password: '',
                confirmPassword: '',
                email: '',
                phoneNumber: '',
                firstName: 'Invalid First Name',
                lastName: '',
            });
            return false;
        }

        // Validate last name
        if (!namePattern.test(lastName)) {
            setAuthErrors({
                password: '',
                confirmPassword: '',
                email: '',
                phoneNumber: '',
                firstName: '',
                lastName: 'Invalid Last Name',
            });
            return false;
        }

        if (phoneNumber.length !== 10) {
            setAuthErrors({
                password: '',
                confirmPassword: '',
                email: '',
                phoneNumber: 'Phone number must be 10 digits long',
                firstName: '',
                lastName: '',
            });
            return false;
        }

        if (!phoneNumberPattern.test(phoneNumber)) {
            setAuthErrors({
                password: '',
                confirmPassword: '',
                email: '',
                phoneNumber: 'Please enter valid phone number',
                firstName: '',
                lastName: '',
            });
            return false;
        }

        if (!isValidEmail(email.toLowerCase())) {
            setAuthErrors({
                password: '',
                confirmPassword: '',
                email: 'Invalid Email Address',
                phoneNumber: '',
                firstName: '',
                lastName: '',
            });
            return false;
        }

        if (password !== confirmPassword) {
            setAuthErrors({
                password: '',
                confirmPassword: 'Passwords Does not Match',
                email: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
            });
            return false;
        }

        if (password.length < 8 || confirmPassword.length < 8) {
            setAuthErrors({
                password: 'Password must be at least 8 characters Long',
                confirmPassword: '',
                email: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
            });
            return false;
        }

        if (!passwordPattern.test(password)) {
            setAuthErrors({
                password: 'Password must contain at least 1 Uppercase, 1 Lowercase, 1 Number and 1 Special Character',
                confirmPassword: '',
                email: '',
                phoneNumber: '',
                firstName: '',
                lastName: '',
            });
            return false;
        }

        if (!agree) {
            setAgreeError(true);
            return false;
        }

        return true;
    };

    const firebaseAuthHandler = async (event: any) => {
        setAuthErrors({
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
        });
        setFirebaseError(null);
        setAgreeError(false);
        event.preventDefault();
        if (isValidEmailAndPassword() && agree) {
            setLoading(true);
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                await sendEmailVerification(userCredential.user);
                // localStorage.setItem('user_first_name', formData.firstName);
                // localStorage.setItem('user_last_name', formData.lastName);

                const dataToCreateUser = {
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    email: formData.email,
                    userRole: 'Driver',
                    channelName: 'Bundee',
                    mobilephone: formData.phoneNumber,
                };
                const bundee_auth_token = localStorage.getItem('bundee_auth_token');

                const data = await createNewUser(dataToCreateUser, bundee_auth_token);

                console.log('create new user data' + data);
                if (data.errorcode == '0') {
                    setRedirect(true);
                } else {
                    throw new Error('Unable to create user');
                }
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    setFirebaseError('Account Already exist please login');
                } else {
                    setFirebaseError('An error occurred during sign up');
                }
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <ToastContainer className='h-20' />

            <div className='flex'>
                <div className='flex-1 h-full max-w-5xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg '>
                    <div className='flex flex-col overflow-y-auto md:flex-row'>
                        <div className='h-32 md:h-auto md:w-1/2'>
                            <img aria-hidden='true' className='object-cover mr-10 w-full h-full dark:hidden' src='/login.jpg' alt='Office' />
                        </div>
                        <main className='flex items-center justify-center p-6 sm:p-12 md:w-1/2 dark:text-white'>
                            <div className='w-full'>
                                <div className='flex flex-col items-center gap-4'>
                                    <Logo />

                                    <span className='mb-4 ml-4 text-xl font-semibold text-neutral-700 dark:text-neutral-200'>Sign Up for your account</span>
                                </div>
                                <form
                                    onSubmit={() => {
                                        firebaseAuthHandler(event);
                                    }}>
                                    <div className='grid grid-cols-6 gap-2 mb-3'>
                                        <div className='col-span-6 sm:col-span-3'>
                                            <label className='block text-sm font-medium leading-6 text-neutral-900'>First Name</label>
                                            <div className='mt-2'>
                                                <Input
                                                    id='firstName'
                                                    name='firstName'
                                                    type='text'
                                                    required
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className={`block w-full ${authErrors.firstName ? 'border-destructive' : ''}`}
                                                />
                                            </div>
                                            {authErrors.firstName && <p className='mt-2 text-destructive font-medium text-xs'>{authErrors.firstName}</p>}
                                        </div>
                                        <div className='col-span-6 sm:col-span-3'>
                                            <label className='block text-sm font-medium leading-6 text-neutral-900'>Last Name</label>
                                            <div className='mt-2'>
                                                <Input
                                                    id='lastName'
                                                    name='lastName'
                                                    type='text'
                                                    required
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className={`block w-full ${authErrors.lastName ? 'border-destructive' : ''}`}
                                                />
                                            </div>
                                            {authErrors.lastName && <p className='mt-2 text-destructive font-medium text-xs'>{authErrors.lastName}</p>}
                                        </div>
                                    </div>
                                    <label className='block text-sm font-medium leading-6 text-neutral-900'>Mobile Phone Number</label>
                                    <div className='mt-2'>
                                        <Input
                                            id='phoneNumber'
                                            name='phoneNumber'
                                            required
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className={`block w-full ${authErrors.phoneNumber ? 'border-destructive' : ''}`}
                                        />
                                        {authErrors.phoneNumber && <p className='mt-2 text-destructive font-medium text-xs'>{authErrors.phoneNumber}</p>}
                                    </div>
                                    <div className='mt-4'>
                                        <label className='block text-sm font-medium leading-6 text-neutral-900'>Email address</label>
                                        <div className='mt-2'>
                                            <Input
                                                id='email'
                                                name='email'
                                                type='email'
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`block w-full ${authErrors.email ? 'border-destructive' : ''}`}
                                            />
                                        </div>
                                        {authErrors.email && <p className='mt-2 text-destructive font-medium text-xs'>{authErrors.email}</p>}
                                    </div>

                                    <div className='mt-4'>
                                        <label className='block text-sm font-medium leading-6 text-neutral-900'>Password</label>
                                        <div className='relative'>
                                            <button
                                                tabIndex={-1}
                                                type='button'
                                                onClick={() => {
                                                    ssp(!sp);
                                                }}
                                                className='bg-white  rounded-md text-xs p-2 absolute top-1 right-2'>
                                                {sp == true ? <FaEye /> : <FaEyeSlash />}
                                            </button>

                                            <Input
                                                id='password'
                                                name='password'
                                                type={sp == true ? 'password' : 'text'}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`block w-full ${authErrors.password ? 'border-destructive' : ''}`}
                                            />
                                        </div>
                                        {authErrors.password && <p className='mt-2 text-destructive font-medium text-xs'>{authErrors.password}</p>}
                                    </div>
                                    <div className='mt-4'>
                                        <label className='block text-sm font-medium leading-6 text-neutral-900'>Confirm Password</label>
                                        <div className='relative'>
                                            <button
                                                tabIndex={-1}
                                                type='button'
                                                onClick={() => {
                                                    sscp(!scp);
                                                }}
                                                className='bg-white  rounded-md text-xs p-2 absolute top-1 right-2'>
                                                {scp == true ? <FaEye /> : <FaEyeSlash />}
                                            </button>

                                            <Input
                                                id='confirmPassword'
                                                name='confirmPassword'
                                                type={scp == true ? 'password' : 'text'}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`block w-full ${authErrors.confirmPassword ? 'border-destructive' : ''}`}
                                            />
                                        </div>
                                        {authErrors.confirmPassword && <p className='mt-2 text-destructive font-medium text-xs'>{authErrors.confirmPassword}</p>}
                                    </div>
                                    <div className=' mt-4 relative flex gap-x-3'>
                                        <div className='flex h-6 items-center'>
                                            <input
                                                id='candidates'
                                                name='candidates'
                                                type='checkbox'
                                                className='h-4 w-4 rounded accent-black border-neutral-300'
                                                checked={agree}
                                                onChange={() => {
                                                    setAgree(!agree);
                                                }}
                                            />
                                        </div>
                                        <div className='text-sm leading-6'>
                                            <p className='text-neutral-500'>
                                                I agree the{' '}
                                                <Link href='/terms' className='text-primary underline underline-offset-4'>
                                                    terms
                                                </Link>{' '}
                                                and{' '}
                                                <Link href='/privacy' className='text-primary underline underline-offset-4'>
                                                    conditions
                                                </Link>{' '}
                                                of Bundee .
                                            </p>
                                        </div>
                                    </div>

                                    {agreeError ? (
                                        <div className='my-3 rounded-md bg-red-50 p-3 select-none'>
                                            <div className='flex'>
                                                <div className='flex-shrink-0'>
                                                    <IoWarning className='h-5 w-5 text-red-400' />
                                                </div>
                                                <div className='ml-3'>
                                                    <p className='text-sm font-medium text-red-800'>Please Agree the Privacy policy and terms of use and continue.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {firebaseError ? (
                                        <div className='my-3 rounded-md bg-red-50 p-3 select-none'>
                                            <div className='flex'>
                                                <div className='flex-shrink-0'>
                                                    <IoWarning className='h-5 w-5 text-red-400' />
                                                </div>
                                                <div className='ml-3'>
                                                    <p className='text-sm font-medium text-red-800'>{firebaseError}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className='mt-6'>
                                        <Button disabled={loading} className='w-full' type='submit'>
                                            {loading ? (
                                                <p>
                                                    <LuLoader2 className='w-5 h-5 text-white animate-spin' />
                                                </p>
                                            ) : (
                                                <p>Sign Up</p>
                                            )}
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
                                <p className='mt-4 text-center dark:text-neutral-200'>
                                    Already have an account?
                                    <Link className='text-base font-medium text-primary mx-2  hover:underline' href='/auth/login'>
                                        Login
                                    </Link>
                                    here
                                </p>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
