import { getSession } from '@/lib/auth';
import { HomeIcon } from '@radix-ui/react-icons';
import { GoShieldCheck } from 'react-icons/go';
import { HiOutlineUser } from 'react-icons/hi2';
import { IoMdHeartEmpty } from 'react-icons/io';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { PiTruck } from 'react-icons/pi';
import ClientOnly from '../ClientOnly';
import Container from '../BoxContainer';
import Logo from '../landing_page/Logo';
import LoginSignupButtons from './LoginSignupButtons';
import UserMenu from './UserMenu';
import NotificationsComponent from './Notifications';

const Navbar = async () => {
    const session = await getSession();

    const menuItems: any[] = [
        { label: 'Home', icon: <HomeIcon className='mr-2 h-4 w-4' />, link: '/', visible: true },
        { label: 'Profile', icon: <HiOutlineUser className='mr-2 h-4 w-4' />, link: '/profile', visible: session.isLoggedIn ? true : false },
        { label: 'Trips', icon: <PiTruck className='mr-2 h-4 w-4' />, link: '/trips', visible: session.isLoggedIn ? true : false },
        { label: 'Wishlist', icon: <IoMdHeartEmpty className='mr-2 h-4 w-4' />, link: '/wishlists', visible: session.isLoggedIn ? true : false },
        { label: 'Terms & Conditions', icon: <IoDocumentTextOutline className='mr-2 h-4 w-4' />, link: '/terms', visible: true },
        { label: "FAQ's", icon: <IoDocumentTextOutline className='mr-2 h-4 w-4' />, link: '/#faqs', visible: true },
        { label: 'Privacy Policy', icon: <GoShieldCheck className='mr-2 h-4 w-4' />, link: '/privacy', visible: true },
    ];

    return (
        <>
            <header className=' sticky top-0 z-20 bg-white py-2.5 shadow-sm select-none'>
                <Container>
                    <nav className='flex items-center justify-between '>
                        <Logo />

                        <div className='flex items-center gap-3'>
                            {!session.isLoggedIn && (
                                <ClientOnly>
                                    <LoginSignupButtons />
                                </ClientOnly>
                            )}
                            {session.isLoggedIn && session.email && (
                                <ClientOnly>
                                    <p className='hidden text-xs sm:block'>{session.email}</p>
                                    <NotificationsComponent />
                                </ClientOnly>
                            )}

                            <UserMenu menuItems={menuItems} isLoggedIn={session.isLoggedIn} />
                        </div>
                    </nav>
                </Container>
            </header>
        </>
    );
};

export default Navbar;