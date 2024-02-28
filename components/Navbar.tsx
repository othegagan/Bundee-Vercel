'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/app/auth/firebase';
import NotificationPopoverItem from './Notifications';
import Logo from './landing_page/Logo';
import { useUserAuth } from '@/lib/authContext';

const Navbar = () => {
    const { user, logOut } = useUserAuth();
    // const [userLoggedin, setuserLoggedin] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const currentPathName = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const sessionEmail = localStorage.getItem('session_user');

        setUserEmail(sessionEmail);
    }, []);

    function setAuthSuccessURLHandler() {
        let queryString = '';
        searchParams.forEach((value, key) => {
            queryString += `${key}=${value}&`;
        });

        queryString = queryString.slice(0, -1);
        queryString = currentPathName + '?' + queryString;

        localStorage.setItem('authCallbackSuccessUrl', queryString);
    }

    function firebaseLogoutHandler() {
        localStorage.setItem('authCallbackSuccessUrl', currentPathName);
        localStorage.removeItem('session_user');
        localStorage.removeItem('user_first_name');
        localStorage.removeItem('user_last_name');
        localStorage.removeItem('email_veirfy_status');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_login');
        localStorage.removeItem('userId');
        localStorage.removeItem('checkOutInfo');
        localStorage.removeItem('personaCallback');
        localStorage.removeItem('profilePicture');

        const redirectURI = localStorage.getItem('authCallbackSuccessUrl');

        logOut();

        window.location.href = '/';
    }

    return (
        <header className=' bg-white sticky top-0 z-20 shadow-sm'>
            <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 py-2'>
                <nav className='flex items-center justify-between '>
                    <Logo />

                    <div className='flex gap-3'>
                        {!user && !userEmail && (
                            <div className='fle'>
                                <Link href='/auth/login'>
                                    <Button onClick={setAuthSuccessURLHandler} variant='outline'>
                                        Login
                                    </Button>
                                </Link>

                                <Link href='/auth/signup'>
                                    <Button className='ml-4 bg-black'>Sign Up</Button>
                                </Link>
                            </div>
                        )}
                        {user && userEmail && (
                            <div className='hidden flex-col justify-center items-end sm:flex'>
                                {/* <p className='text-xs font-bold'>Sundar Raj Sharma</p> */}
                                <p className='text-xs'>{userEmail}</p>
                            </div>
                        )}

                        <div className='z-50'>{user && userEmail && <NotificationPopoverItem />}</div>

                        {/* {userLoggedin == true && (
                            <img className=" border-spacing-0 shadow-md h-8 w-8 flex-none rounded-full bg-gray-50" src="/neutral_image_avatar.png" alt="" />
                        )} */}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type='button' className='inline-flex p-2 text-black transition-all duration-200 rounded-md  focus:bg-gray-100 hover:bg-gray-100'>
                                    <svg className='block w-6 h-6' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 8h16M4 16h16' />
                                    </svg>

                                    <svg className='hidden w-6 h-6' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-56'>
                                <DropdownMenuLabel>Menu</DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Link href='/' className='flex w-full '>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                strokeWidth='1.5'
                                                stroke='currentColor'
                                                className='w-4 h-4 mr-2'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
                                                />
                                            </svg>
                                            Home
                                        </Link>
                                    </DropdownMenuItem>

                                    {user && userEmail && (
                                        <DropdownMenuItem>
                                            <Link href='/profile' className='flex w-full '>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    strokeWidth={1}
                                                    stroke='currentColor'
                                                    className='w-4 h-4 mr-2'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
                                                    />
                                                </svg>
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    {user && userEmail && (
                                        <DropdownMenuItem>
                                            <Link href='/trips' className='flex w-full '>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    strokeWidth='1.5'
                                                    stroke='currentColor'
                                                    className='w-4 h-4 mr-2'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
                                                    />
                                                </svg>
                                                Trips
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    {user && userEmail && (
                                        <DropdownMenuItem>
                                            <Link href='/wishlists' className='flex w-full '>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    strokeWidth='1.5'
                                                    stroke='currentColor'
                                                    className='w-4 h-4 mr-2'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
                                                    />
                                                </svg>
                                                Wishlist
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem>
                                        <Link href='/terms' className='flex w-full '>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                strokeWidth={1.5}
                                                stroke='currentColor'
                                                className='w-4 h-4 mr-2'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
                                                />
                                            </svg>
                                            Terms & conditions
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem>
                                        <Link href='/#faqs' className='flex w-full '>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                strokeWidth={1.5}
                                                stroke='currentColor'
                                                className='w-4 h-4 mr-2'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
                                                />
                                            </svg>
                                            FAQ's
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href='/privacy' className='flex w-full '>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                strokeWidth='1.5'
                                                stroke='currentColor'
                                                className='w-4 h-4 mr-2'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
                                                />
                                            </svg>
                                            Privacy Policy
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                {user && userEmail && (
                                    <DropdownMenuItem>
                                        <button onClick={firebaseLogoutHandler} className='w-full'>
                                            <div className='flex w-full'>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    strokeWidth='1.5'
                                                    stroke='currentColor'
                                                    className='w-4 h-4 mr-2 '>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
                                                    />
                                                </svg>
                                                Log out
                                            </div>
                                        </button>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
