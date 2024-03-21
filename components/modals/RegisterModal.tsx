'use client';

import Logo from '@/components/landing_page/Logo';
import useLoginModal from '@/hooks/useLoginModal';
import useRegisterModal from '@/hooks/useRegisterModal';
import { login, logout } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { createNewUser } from '@/server/createNewUser';
import { getBundeeToken, getUserByEmail } from '@/server/userOperations';
import { GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoWarning } from 'react-icons/io5';
import { LuLoader2 } from 'react-icons/lu';
import ClientOnly from '../ClientOnly';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const RegisterModal = () => {
    const router = useRouter();
    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();

    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    const [agree, setAgree] = useState(false);
    const [agreeError, setAgreeError] = useState(false);
    const [firebaseError, setFirebaseError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSucessfullSignUp, setShowSucessfullSignUp] = useState(false);

    const [marketingAgree, setMarketingAgree] = useState(false);
    const [marketingAgreeError, setMarketingAgreeError] = useState(false);

    const [accountUpdateAgree, setAccountUpdateAgree] = useState(false);
    const [accountUpdateAgreeError, setAccountUpdateAgreeError] = useState(false);

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

    const onToggle = useCallback(() => {
        loginModal.onOpen();
        registerModal.onClose();
        setAgree(false);
        setAgreeError(false);
        setAccountUpdateAgree(false);
        setAccountUpdateAgreeError(false);
        setMarketingAgree(false);
        setMarketingAgreeError(false);
    }, [loginModal, registerModal]);

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
        if (checkForValidations() && agree) {
            setLoading(true);
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                await sendEmailVerification(userCredential.user);

                const dataToCreateUser = {
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    email: formData.email,
                    mobilephone: formData.phoneNumber,
                };

                const data = await createNewUser(dataToCreateUser);

                if (data.success) {
                    setShowSucessfullSignUp(true);
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

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async result => {
                // Handle successful sign-in
                // console.log(result.user.email);

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
                        const userResponse = createUserResponse.data.userResponse;
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
                console.log(error.message);
                logout();
            });
    };

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

    const checkForValidations = () => {
        const { email, password, confirmPassword, phoneNumber, firstName, lastName } = formData;
        const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:;<>,.?~\\[\]-]).{8,}$/;
        const phoneNumberPattern = /^\d{10}$/;
        const namePattern = /^[a-zA-Z\s]+$/;
        setAgreeError(false);
        setMarketingAgreeError(false);
        setAccountUpdateAgreeError(false);

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

        if (!marketingAgree) {
            setMarketingAgreeError(true);
            return false;
        }

        if (!accountUpdateAgree) {
            setAccountUpdateAgreeError(true);
            return false;
        }

        return true;
    };

    function openModal() {
        registerModal.onOpen();
    }
    function closeModal() {
        registerModal.onClose();
        setShowSucessfullSignUp(false);
        setAgree(false);
        setAgreeError(false);
        setAccountUpdateAgree(false);
        setAccountUpdateAgreeError(false);
        setMarketingAgree(false);
        setMarketingAgreeError(false);

        setFormData({
            email: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        });
    }

    function isValidEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    return (
        <Modal isOpen={registerModal.isOpen} onClose={closeModal} className=' md:scale-[0.85] lg:max-w-lg'>
            <ModalHeader onClose={closeModal}>
                <div className='md:px-4'>Sign Up with Bundee account</div>
            </ModalHeader>
            <ModalBody>
                <ClientOnly>
                    <main className='flex items-center justify-center  md:px-4'>
                        {!showSucessfullSignUp && (
                            <div className='w-full'>
                                {/* <div className='flex flex-col items-center gap-4 mt-3 md:mt-0'>
                                    <Logo className='scale-[1.3]' />

                                    <span className='mb-4 ml-4 text-xl font-semibold text-neutral-700 '>Sign Up with Bundee account</span>
                                </div> */}
                                <form
                                    onSubmit={() => {
                                        firebaseAuthHandler(event);
                                    }}>
                                    <div className='mb-3 grid grid-cols-6 gap-2'>
                                        <div className='col-span-6 sm:col-span-3'>
                                            <Label>First Name</Label>
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
                                            {authErrors.firstName && <p className='mt-2 text-xs font-medium text-destructive'>{authErrors.firstName}</p>}
                                        </div>
                                        <div className='col-span-6 sm:col-span-3'>
                                            <Label>Last Name</Label>
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
                                            {authErrors.lastName && <p className='mt-2 text-xs font-medium text-destructive'>{authErrors.lastName}</p>}
                                        </div>
                                    </div>
                                    <Label>Phone Number</Label>
                                    <div className='mt-2'>
                                        <Input
                                            id='phoneNumber'
                                            name='phoneNumber'
                                            required
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className={`block w-full ${authErrors.phoneNumber ? 'border-destructive' : ''}`}
                                        />
                                        {authErrors.phoneNumber && <p className='mt-2 text-xs font-medium text-destructive'>{authErrors.phoneNumber}</p>}
                                    </div>
                                    <div className='mt-4'>
                                        <Label>Email address</Label>
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
                                        {authErrors.email && <p className='mt-2 text-xs font-medium text-destructive'>{authErrors.email}</p>}
                                    </div>

                                    <div className='mt-4'>
                                        <Label>Password</Label>
                                        <div className='relative'>
                                            <button
                                                tabIndex={-1}
                                                type='button'
                                                onClick={() => {
                                                    setShowPassword(!showPassword);
                                                }}
                                                className='absolute  right-2 top-1 rounded-md bg-white p-2 text-xs'>
                                                {showPassword == true ? <FaEye /> : <FaEyeSlash />}
                                            </button>

                                            <Input
                                                id='password'
                                                name='password'
                                                type={showPassword == true ? 'password' : 'text'}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`block w-full ${authErrors.password ? 'border-destructive' : ''}`}
                                            />
                                        </div>
                                        {authErrors.password && <p className='mt-2 text-xs font-medium text-destructive'>{authErrors.password}</p>}
                                    </div>
                                    <div className='mt-4'>
                                        <Label>Confirm Password</Label>
                                        <div className='relative'>
                                            <button
                                                tabIndex={-1}
                                                type='button'
                                                onClick={() => {
                                                    setShowConfirmPassword(!showConfirmPassword);
                                                }}
                                                className='absolute  right-2 top-1 rounded-md bg-white p-2 text-xs'>
                                                {showConfirmPassword == true ? <FaEye /> : <FaEyeSlash />}
                                            </button>

                                            <Input
                                                id='confirmPassword'
                                                name='confirmPassword'
                                                type={showConfirmPassword == true ? 'password' : 'text'}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`block w-full ${authErrors.confirmPassword ? 'border-destructive' : ''}`}
                                            />
                                        </div>
                                        {authErrors.confirmPassword && (
                                            <p className='mt-2 text-xs font-medium text-destructive'>{authErrors.confirmPassword}</p>
                                        )}
                                    </div>
                                    <div className=' relative mt-4 flex gap-x-3'>
                                        <label htmlFor='candidates' className='flex gap-x-3'>
                                            <div className='flex h-6 items-center'>
                                                <input
                                                    id='candidates'
                                                    name='candidates'
                                                    type='checkbox'
                                                    className='h-4 w-4 rounded border-neutral-300 accent-black'
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
                                        </label>
                                    </div>
                                    {agreeError && <ErrorMessage message='Please Agree the Privacy policy and terms of use and continue.' />}

                                    <div className=' relative mt-2 flex gap-x-3'>
                                        <label htmlFor='marketingAgree' className='flex gap-x-3'>
                                            <div className='flex h-6 items-center'>
                                                <input
                                                    id='marketingAgree'
                                                    name='marketingAgree'
                                                    type='checkbox'
                                                    className='h-4 w-4 rounded border-neutral-300 accent-black'
                                                    checked={marketingAgree}
                                                    onChange={() => {
                                                        setMarketingAgree(!marketingAgree);
                                                    }}
                                                />
                                            </div>
                                            <div className='text-sm leading-6'>
                                                <p className='text-neutral-500'>I agree to receive marketing SMS messages from Bundee.</p>
                                            </div>
                                        </label>
                                    </div>
                                    {marketingAgreeError && <ErrorMessage message='Please Agree to receive marketing SMS messages from Bundee.' />}

                                    <div className=' relative mt-2 flex gap-x-3'>
                                        <label htmlFor='accountUpdateAgree' className='flex gap-x-3'>
                                            <div className='flex h-6 items-center'>
                                                <input
                                                    id='accountUpdateAgree'
                                                    name='accountUpdateAgree'
                                                    type='checkbox'
                                                    className='h-4 w-4 rounded border-neutral-300 accent-black'
                                                    checked={accountUpdateAgree}
                                                    onChange={() => {
                                                        setAccountUpdateAgree(!accountUpdateAgree);
                                                    }}
                                                />
                                            </div>
                                            <div className='text-sm leading-6'>
                                                <p className='text-neutral-500'>I agree to receive account update SMS messages from Bundee.</p>
                                            </div>
                                        </label>
                                    </div>
                                    {accountUpdateAgreeError && <ErrorMessage message='Please Agree to receive account update SMS messages from Bundee.' />}

                                    {firebaseError && <ErrorMessage message={firebaseError} />}

                                    <div className='mt-6'>
                                        <Button disabled={loading} className='w-full' type='submit'>
                                            {loading ? (
                                                <p>
                                                    <LuLoader2 className='h-5 w-5 animate-spin text-white' />
                                                </p>
                                            ) : (
                                                <>Sign Up</>
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
                                    className='flex w-full gap-4  py-5'>
                                    <img className='h-5 w-5' src='https://www.svgrepo.com/show/475656/google-color.svg' loading='lazy' alt='google logo' />
                                    <span>Continue with Google</span>
                                </Button>

                                <div className='mt-4 flex flex-col gap-2'>
                                    <p className='mt-1 '>
                                        Already have an account?
                                        <span onClick={onToggle} className='mx-1 cursor-pointer text-base font-medium text-primary  hover:underline'>
                                            Login
                                        </span>
                                        here
                                    </p>
                                </div>
                            </div>
                        )}

                        {showSucessfullSignUp && (
                            <div className='flex flex-col items-center justify-center gap-4'>
                                <img src='./party.svg' alt='party_cone' className='h-40 w-96 object-contain' />
                                <h3>Thanks {formData.firstName} for joining the Bundee</h3>
                                <p className='text-center'>
                                    A verification email has been sent successfully..! <br /> Please check your inbox and click on the verification link.
                                </p>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='lg'
                                    onClick={() => {
                                        loginModal.onOpen();
                                        closeModal();
                                        setShowSucessfullSignUp(false);
                                    }}>
                                    Login
                                </Button>
                            </div>
                        )}
                    </main>
                </ClientOnly>
            </ModalBody>
        </Modal>
    );
};

export default RegisterModal;

const ErrorMessage = ({ message }) => (
    <div className='my-3 select-none rounded-md bg-red-50 p-3'>
        <div className='flex'>
            <div className='flex-shrink-0'>
                <IoWarning className='h-5 w-5 text-red-400' />
            </div>
            <div className='ml-3'>
                <p className='text-sm font-medium text-red-800'>{message}</p>
            </div>
        </div>
    </div>
);
