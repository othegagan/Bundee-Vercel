'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useUserAuth } from '@/lib/authContext';
import { HomeIcon } from '@radix-ui/react-icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GoShieldCheck } from 'react-icons/go';
import { HiOutlineUser } from 'react-icons/hi2';
import { IoMdHeartEmpty } from 'react-icons/io';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { PiTruck } from 'react-icons/pi';
import { TbLogout2 } from 'react-icons/tb';
import NotificationPopoverItem from './Notifications';
import Logo from './landing_page/Logo';

const Navbar = () => {
    const { user, logOut } = useUserAuth();
    const router = useRouter();
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

    const menuItems: any = [
        { label: 'Home', icon: <HomeIcon className='mr-2 h-4 w-4' />, link: '/', visible: true },
        { label: 'Profile', icon: <HiOutlineUser className='mr-2 h-4 w-4' />, link: '/profile', visible: user ? true : false },
        { label: 'Trips', icon: <PiTruck className='mr-2 h-4 w-4' />, link: '/trips', visible: user ? true : false },
        { label: 'Wishlist', icon: <IoMdHeartEmpty className='mr-2 h-4 w-4' />, link: '/wishlists', visible: user ? true : false },
        { label: 'Terms & Conditions', icon: <IoDocumentTextOutline className='mr-2 h-4 w-4' />, link: '/terms', visible: true },
        { label: "FAQ's", icon: <IoDocumentTextOutline className='mr-2 h-4 w-4' />, link: '/#faqs', visible: true },
        { label: 'Privacy Policy', icon: <GoShieldCheck className='mr-2 h-4 w-4' />, link: '/privacy', visible: true },
    ];

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
                                <p className='text-xs'>{userEmail}</p>
                            </div>
                        )}

                        <div className='z-50'>{user && userEmail && <NotificationPopoverItem />}</div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type='button' className='inline-flex rounded-md p-2 text-black transition-all duration-200  hover:bg-gray-100 focus:bg-gray-100'>
                                    <svg className='block h-6 w-6' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 8h16M4 16h16' />
                                    </svg>

                                    <svg className='hidden h-6 w-6' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-56'>
                                <DropdownMenuGroup>
                                    {menuItems.map((item: any) => (
                                        <DropdownMenuItem key={item.label} className={`${item.visible ? 'block' : 'hidden'}`}>
                                            <button onClick={() => router.push(item.link)} className='flex w-full'>
                                                {item.icon}
                                                {item.label}
                                            </button>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />

                                {user && userEmail ? (
                                    <DropdownMenuItem>
                                        <button onClick={firebaseLogoutHandler} className='w-full'>
                                            <div className='flex w-full'>
                                                <TbLogout2 className='mr-2 h-4 w-4' />
                                                Log out
                                            </div>
                                        </button>
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
