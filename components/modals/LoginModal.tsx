'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import useLoginModal from '@/hooks/useLoginModal';
import useRegisterModal from '@/hooks/useRegisterModal';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { useCallback, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa6';
import { IoWarning } from 'react-icons/io5';
import { LuLoader2 } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import { login, logout } from '@/lib/auth';
import { createNewUser } from '@/server/createNewUser';
import { getBundeeToken, getUserByEmail } from '@/server/userOperations';
import Link from 'next/link';
import ClientOnly from '../ClientOnly';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import Logo from '@/components/landing_page/Logo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import usePhoneNumberSignInModal from '@/hooks/usePhoneNumberSignModal';

const LoginModal = () => {
    const router = useRouter();
    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();
    const phoneNumberSignInModal = usePhoneNumberSignInModal();
    const [showPassword, setShowPassword] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const onToggle = useCallback(() => {
        loginModal.onClose();
        registerModal.onOpen();
    }, [loginModal, registerModal]);

    const handleLogin = async event => {
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
                        closeModal();
                        await login({ userData: userResponse, authToken: authTokenResponse.authToken });
                        router.refresh();
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

    const handleAuthError = error => {
        const errorMap = {
            'auth/user-not-found': 'User account not found.',
            'auth/wrong-password': 'Incorrect password. Try again.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many requests. Please try again later.',
            'auth/user-disabled': 'Account has been disabled.',
            'auth/missing-password': 'Please enter your password.',
            'auth/invalid-credential': 'Invailid Credentials. Please try again.',
            'auth/invalid-login-credentials': 'Invailid Credentials. Please try again.',
            default: 'An error occurred. Please try again.',
        };
        setPassword('');
        setAuthError(errorMap[error.code] || errorMap.default);
    };

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async result => {
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
                        closeModal();
                        await login(payload);
                        router.refresh();
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
                        await login({ userData: userResponse, authToken: authTokenResponse.authToken });
                        router.refresh();
                        closeModal();
                    } else {
                        throw new Error('Unable to create user');
                    }
                }
            })
            .catch(error => {
                // Handle sign-in error
                handleAuthError(error);
                console.log(error.message);
                logout();
            });
    };

    function openModal() {
        setPassword('');
        setUserEmail('');
        setShowPassword(false);
        loginModal.onOpen();
    }
    function closeModal() {
        setPassword('');
        setUserEmail('');
        setShowPassword(false);
        setAuthError('');
        loginModal.onClose();
    }

    function openPhoneLogin() {
        closeModal();
        phoneNumberSignInModal.onOpen();
    }
    return (
        <Modal isOpen={loginModal.isOpen} onClose={closeModal} className='lg:max-w-lg'>
            <ModalHeader onClose={closeModal}>{''}</ModalHeader>
            <ModalBody className={`  transition-all delay-1000 ${!loginModal.isOpen ? ' rotate-90' : ' rotate-0'}`}>
                <ClientOnly>
                    <main className='flex items-center justify-center p-2 md:p-6 '>
                        <div className='w-full'>
                            <div className='flex flex-col items-center gap-4'>
                                <Logo className='scale-[1.3]' />

                                <span className='mb-4 ml-4 text-xl font-semibold text-neutral-700 '>Login with Bundee account</span>
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
                                <label htmlFor='password' className='mt-4 block text-sm font-medium text-gray-700'>
                                    Password
                                </label>
                                <div className='relative'>
                                    <div
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                        className='absolute right-2 top-1 cursor-pointer p-2 text-xs'>
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
                                    {loading ? <LuLoader2 className='h-5 w-5 animate-spin text-white' /> : <>Log in</>}
                                </Button>
                            </form>

                            <hr className='my-4' />

                            <Button
                                onClick={() => {
                                    googleSignIn();
                                }}
                                variant='outline'
                                className='flex w-full gap-4  py-5'>
                                <img className='h-5 w-5' src='https://www.svgrepo.com/show/475656/google-color.svg' loading='lazy' alt='google logo' />
                                <span>Continue with Google</span>
                            </Button>

                            <Button onClick={openPhoneLogin} type='button' variant='outline' className='mt-3 flex w-full  gap-3 py-5'>
                                <FaPhone className='size-5 scale-95' />
                                <span>Sign in with Phone number</span>
                            </Button>

                            <div className='mt-4 flex flex-col gap-2'>
                                <Link className='w-fit text-sm font-medium text-primary hover:underline' href='/'>
                                    Forgot your password?
                                </Link>

                                <p className='mt-1 text-base'>
                                    Don't have an account?
                                    <span onClick={onToggle} className='mx-1 cursor-pointer text-base font-medium text-primary  hover:underline'>
                                        Sign up
                                    </span>
                                    here
                                </p>
                            </div>
                        </div>
                    </main>
                </ClientOnly>
            </ModalBody>
        </Modal>
    );
};

export default LoginModal;
