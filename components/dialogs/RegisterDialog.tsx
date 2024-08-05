'use client';

import useLoginDialog from '@/hooks/dialogHooks/useLoginDialog';
import useRegisterDialog from '@/hooks/dialogHooks/useRegisterDialog';
import { createSession, destroySession } from '@/lib/auth';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { createNewUser } from '@/server/createNewUser';
import { getBundeeToken, getUserByEmail } from '@/server/userOperations';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Dialog, DialogBody } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import PhoneNumber from '../ui/phone-number';

export const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;

const RegisterSchema = z
    .object({
        firstName: z.string({ message: 'First Name is required' }).min(2, { message: 'Must be at least 2 characters' }).trim(),
        lastName: z.string({ message: 'Last Name is required' }).min(2, { message: 'Must be at least 2 characters' }).trim(),
        email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
        phoneNumber: z.string({ message: 'Phone Number is required' }).optional(),
        password: z
            .string({ message: 'Password is required' })
            .min(6, { message: 'Password must be at least 6 characters' })
            .regex(passwordRegex, { message: 'Password must contain at least one number and one special character' }),
        confirmPassword: z.string({ message: 'Confirm Password is required' }),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: 'You must accept the terms and privacy statements',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword'],
    });

type FormFields = z.infer<typeof RegisterSchema>;

export default function RegisterDialog() {
    const router = useRouter();
    const loginDialog = useLoginDialog();
    const registerDialog = useRegisterDialog();

    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState('');

    const [showSuccessfulSignUp, setShowSuccessfulSignUp] = useState(false);

    const onToggle = useCallback(() => {
        closeModal();
        loginDialog.onOpen();
    }, [loginDialog, registerDialog]);

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        resolver: zodResolver(RegisterSchema),
        mode: 'onChange',
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            if (!phoneNumber) {
                setError('phoneNumber', { type: 'custom', message: 'Phone Number is required' });
                return;
            }

            if (phoneNumber.replace(/\ /g, '').length < 11) {
                setError('phoneNumber', { type: 'custom', message: 'Invalid phone number, must be 10 digits' });
                return;
            }

            const { firstName, lastName, email, password } = data;

            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);

            // Prepare data for new user creation
            const dataToCreateUser = {
                firstname: firstName,
                lastname: lastName,
                email,
                mobilephone: `+${phoneNumber}`,
            };

            // Create user in your database
            const createUserResponse = await createNewUser(dataToCreateUser);

            if (createUserResponse.success) {
                setShowSuccessfulSignUp(true);
            } else {
                throw new Error('Unable to create user');
            }
        } catch (error: any) {
            console.error('Sign up error:', error);

            // Handle Firebase errors
            if (error.code) {
                const errorMessage = getFirebaseErrorMessage(error.code);
                setError('root', { type: 'manual', message: errorMessage });
            } else {
                setError('root', { type: 'manual', message: error.message || 'An unexpected error occurred' });
            }
        }
    };

    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const firebaseToken = await user.getIdToken();
            const authTokenResponse = await getBundeeToken(firebaseToken);

            if (authTokenResponse.authToken) {
                const userResponse = await getUserByEmail(user.email);

                if (userResponse.success) {
                    const payload = {
                        userData: userResponse.data.userResponse,
                        authToken: authTokenResponse.authToken,
                    };
                    closeModal();
                    await createSession(payload);
                    router.refresh();
                } else {
                    throw new Error(userResponse.message);
                }
            } else {
                const newUserPayload = {
                    firstname: user.displayName,
                    lastname: '',
                    email: user.email,
                    mobilephone: user.phoneNumber,
                };

                const createUserResponse = await createNewUser(newUserPayload);

                if (createUserResponse.success) {
                    const newUser = createUserResponse.data.userResponses[0];
                    await createSession({ userData: newUser, authToken: authTokenResponse.authToken });
                    router.refresh();
                    closeModal();
                } else {
                    throw new Error('Unable to create user');
                }
            }
        } catch (error) {
            console.error('Error during Google Sign-In:', error.message);
            await destroySession();
        }
    };

    function openModal() {
        registerDialog.onOpen();
    }

    function closeModal() {
        registerDialog.onClose();
        setShowSuccessfulSignUp(false);
        setPhoneNumber('');
        reset();
    }

    return (
        <Dialog
            title='Sign Up with MyBundee'
            description=''
            isOpen={registerDialog.isOpen}
            openDialog={() => {
                openModal();
            }}
            closeDialog={() => {
                closeModal();
            }}
            className=' md:scale-[0.85] lg:max-w-lg'>
            <DialogBody>
                {!showSuccessfulSignUp && (
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='firstName'>
                                        First Name <span>*</span>
                                    </Label>
                                    <Input  type='text' id='firstName' {...register('firstName')} />
                                    <FormError message={errors.firstName?.message} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='lastName'>
                                        Last Name <span>*</span>
                                    </Label>
                                    <Input  type='text' id='lastName' {...register('lastName')} />
                                    <FormError message={errors.lastName?.message} />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='email'>
                                    Email <span>*</span>
                                </Label>
                                <Input  type='email' id='email' {...register('email')} />
                                <FormError message={errors.email?.message} />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='email'>
                                    Phone Number <span>*</span>
                                </Label>
                                <PhoneNumber setPhone={setPhoneNumber} phone={phoneNumber} />
                                <FormError message={errors.phoneNumber?.message} />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='password'>
                                    Password <span>*</span>
                                </Label>
                                <div className='relative'>
                                    <Input type={showPassword ? 'text' : 'password'} id='password' {...register('password')} />
                                    {showPassword ? (
                                        <FaEyeSlash onClick={() => setShowPassword(!showPassword)} className='absolute right-2 top-2.5 cursor-pointer' />
                                    ) : (
                                        <FaEye onClick={() => setShowPassword(!showPassword)} className='absolute right-2 top-2.5 cursor-pointer' />
                                    )}
                                </div>
                                <FormError message={errors.password?.message} />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='password'>
                                    Confirm Password <span>*</span>
                                </Label>
                                <div className='relative'>
                                    <Input type={showConfirmPassword ? 'text' : 'password'} id='confirmPassword' {...register('confirmPassword')} />
                                    {showConfirmPassword ? (
                                        <FaEyeSlash
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className='absolute right-2 top-2.5 cursor-pointer'
                                        />
                                    ) : (
                                        <FaEye
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className='absolute right-2 top-2.5 cursor-pointer'
                                        />
                                    )}
                                </div>
                                <FormError message={errors.confirmPassword?.message} />
                            </div>

                            <div className='space-y-3'>
                                <label className='flex items-center gap-3'>
                                    <input type='checkbox' id='terms' className='scale-[1.1] accent-black' {...register('acceptTerms')} />
                                    <p className='select-none text-xs'>
                                        I agree to MyBundee&apos;s
                                        <Link href='/terms' className='text-primary underline underline-offset-4'>
                                            terms
                                        </Link>
                                        and
                                        <Link href='/privacy' className='text-primary underline underline-offset-4'>
                                            Privacy Statements
                                        </Link>
                                        .
                                    </p>
                                </label>
                                <FormError message={errors.acceptTerms?.message} />

                                <label className='flex items-center gap-3'>
                                    <input type='checkbox' id='terms' className='scale-[1.1] accent-black' checked />
                                    <p className='select-none text-xs'>I agree to receive marketing SMS messages from MyBundee.</p>
                                </label>

                                <label className='flex items-center gap-3'>
                                    <input type='checkbox' id='terms' className='scale-[1.1] accent-black' checked />
                                    <p className='select-none text-xs'>I agree to receive account update SMS messages from MyBundee.</p>
                                </label>
                            </div>

                            {errors.root && <FormError message={errors.root.message} />}

                            <div className='mt-6'>
                                <Button disabled={isSubmitting} loading={isSubmitting} className='w-full' type='submit'>
                                    Sign Up
                                </Button>
                            </div>
                        </form>

                        <hr className='my-4' />
                        <Button
                            onClick={() => {
                                googleSignIn();
                            }}
                            variant='outline'
                            className='flex w-full gap-4  py-5'>
                            <span>Continue with </span>
                            <img className='h-5 w-5' src='https://www.svgrepo.com/show/475656/google-color.svg' loading='lazy' alt='google logo' />
                        </Button>

                        <div className='mt-4 flex flex-col gap-2'>
                            <p className='mt-1 '>
                                Already have an account?
                                <button type='button' onClick={onToggle} className='mx-1 cursor-pointer text-base font-medium text-primary  hover:underline'>
                                    Log In
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {showSuccessfulSignUp && (
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <img src='/images/party.svg' alt='party_cone' className='h-40 w-96 object-contain' />
                        <h3>Thanks for joining MyBundee.</h3>
                        <p className='text-center'>
                            A verification email has been sent successfully..! <br /> Please check your inbox and click on the verification link.
                        </p>
                        <Button
                            type='button'
                            variant='outline'
                            size='lg'
                            onClick={() => {
                                loginDialog.onOpen();
                                closeModal();
                                setShowSuccessfulSignUp(false);
                            }}>
                            Login
                        </Button>
                    </div>
                )}
            </DialogBody>
        </Dialog>
    );
}

const FormError = ({ message }) => <p className='text-xs font-medium text-red-400'>{message}</p>;
