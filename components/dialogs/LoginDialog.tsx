'use client';

import Logo from '@/components/landing_page/Logo';
import useForgotPasswordDialog from '@/hooks/dialogHooks/useForgotPasswordDialog';
import useLoginDialog from '@/hooks/dialogHooks/useLoginDialog';
import usePhoneNumberSignInDialog from '@/hooks/dialogHooks/usePhoneNumberSignInDialog';
import useRegisterDialog from '@/hooks/dialogHooks/useRegisterDialog';
import { createSession, destroySession } from '@/lib/auth';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { createNewUser } from '@/server/createNewUser';
import { getBundeeToken, getUserByEmail } from '@/server/userOperations';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useCallback, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa6';
import { IoWarning } from 'react-icons/io5';
import { LuLoader2 } from 'react-icons/lu';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';

export default function LoginDialog() {
    const loginDialog = useLoginDialog();
    const registerDialog = useRegisterDialog();
    const forgotPasswordDialog = useForgotPasswordDialog();
    const phoneNumberSignInDialog = usePhoneNumberSignInDialog();
    const [showPassword, setShowPassword] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const onToggle = useCallback(() => {
        loginDialog.onClose();
        registerDialog.onOpen();
    }, [loginDialog, registerDialog]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setAuthError('');

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            const user = userCredential.user;
            const firebaseToken = await user.getIdToken();

            if (user.emailVerified) {
                const authTokenResponse = await getBundeeToken(firebaseToken);

                if (authTokenResponse.authToken) {
                    const response: any = await getUserByEmail(user.email);
                    if (response.success) {
                        const userResponse = response.data.userResponse;
                        await createSession({ userData: userResponse, authToken: authTokenResponse.authToken });
                        closeModal();
                        // router.refresh();
                    } else {
                        throw new Error('Error in get user', response.message);
                    }
                } else {
                    throw new Error('Error in getting token', authTokenResponse.message);
                }

                setLoading(false);
            } else {
                setAuthError('Please Verify Your Email.');
            }
        } catch (error) {
            console.log(error);
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (error) => {
        const errorMap = getFirebaseErrorMessage(error.code);
        setAuthError(errorMap);
        setPassword('');
    };

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async (result) => {
                // Handle successful sign-in
                // console.log(result.user);

                const firebaseToken = await result.user.getIdToken();

                const authTokenResponse = await getBundeeToken(firebaseToken);

                if (authTokenResponse.authToken) {
                    const response: any = await getUserByEmail(result.user.email);
                    if (response.success) {
                        const payload: any = {
                            userData: response.data.userResponse,
                            authToken: authTokenResponse.authToken,
                        };
                        await createSession(payload);
                        closeModal();
                        // router.refresh();
                    } else {
                        throw new Error(response.message);
                    }
                } else {
                    const dataToCreateUser = {
                        firstname: result.user.displayName,
                        lastname: '',
                        email: result.user.email,
                        mobilephone: result.user.phoneNumber,
                    };

                    const createUserResponse = await createNewUser(dataToCreateUser);

                    if (createUserResponse.success) {
                        const userResponse = createUserResponse.data.userResponses[0];
                        await createSession({ userData: userResponse, authToken: authTokenResponse.authToken });
                        // router.refresh();
                        closeModal();
                    } else {
                        throw new Error('Unable to create user');
                    }
                }
            })
            .catch(async (error) => {
                // Handle sign-in error
                handleAuthError(error);
                console.log(error.message);
                await destroySession();
            });
    };

    function openModal() {
        setPassword('');
        setUserEmail('');
        setShowPassword(false);
        loginDialog.onOpen();
    }

    function closeModal() {
        setPassword('');
        setUserEmail('');
        setShowPassword(false);
        setAuthError('');
        loginDialog.onClose();
    }

    function openPhoneLogin() {
        closeModal();
        phoneNumberSignInDialog.onOpen();
    }

    return (
        <Dialog
            title=''
            description=''
            isOpen={loginDialog.isOpen}
            openDialog={() => {
                loginDialog.onOpen();
            }}
            closeDialog={() => {
                closeModal();
            }}
            className='lg:max-w-lg'>
            <main className='flex items-center justify-center md:p-6 '>
                <div className='w-full'>
                    <div className='flex flex-col items-center gap-4'>
                        <Logo className='scale-[1.3]' />

                        <span className='mb-4 ml-4 text-xl font-semibold text-neutral-700 '>Log In with MyBundee account</span>
                    </div>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault(); // Prevents the default form submission behavior
                            handleLogin(event);
                        }}>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                            Email address <span>*</span>
                        </label>
                        <div className='mt-1'>
                            <Input
                                id='email'
                                name='email'
                                type='email'
                                autoComplete='email'
                                required
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                        </div>
                        <label htmlFor='password' className='mt-4 block text-sm font-medium text-gray-700'>
                            Password <span>*</span>
                        </label>
                        <div className='relative'>
                            <button
                                type='button'
                                onClick={() => {
                                    setShowPassword(!showPassword);
                                }}
                                className='absolute right-2 top-1 cursor-pointer p-2 text-xs'>
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <div className='mt-1'>
                                <Input
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'password' : 'text'}
                                    autoComplete='current-password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type='button'
                            className='ml-auto mt-3 w-fit cursor-pointer text-sm font-medium text-primary hover:underline'
                            onClick={() => {
                                closeModal();
                                forgotPasswordDialog.onOpen();
                            }}>
                            Forgot Password?
                        </button>

                        {authError ? (
                            <div className='my-3 select-none rounded-md bg-red-50 p-3'>
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

                        <Button disabled={loading} className='mt-4 w-full text-white' type='submit'>
                            {loading ? <LuLoader2 className='h-5 w-5 animate-spin text-white' /> : <>Log In</>}
                        </Button>
                    </form>

                    <hr className='my-4' />

                    <div className='grid grid-cols-2 gap-3'>
                        <Button
                            onClick={() => {
                                googleSignIn();
                            }}
                            variant='outline'
                            className='flex w-full gap-4  py-5'>
                            <span>Continue with </span>
                            <img className='h-5 w-5' src='https://www.svgrepo.com/show/475656/google-color.svg' loading='lazy' alt='google logo' />
                        </Button>

                        <Button onClick={openPhoneLogin} type='button' variant='outline' className='flex w-full  gap-3 py-5'>
                            <span>Log In with Phone</span>
                            <FaPhone className='hidden size-4 scale-95 md:block' />
                        </Button>
                    </div>

                    <div className='mt-4 flex flex-col gap-2'>
                        <p className='mt-1 text-base'>
                            Don't have an account?
                            <button type='button' onClick={onToggle} className='mx-1 cursor-pointer text-base font-medium text-primary  hover:underline'>
                                Sign up
                            </button>
                            here
                        </p>
                    </div>
                </div>
            </main>
        </Dialog>
    );
}
