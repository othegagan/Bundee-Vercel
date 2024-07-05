'use client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import LogoutButton from './LogoutButton';

interface UserMenuProps {
    menuItems: any[];
    isLoggedIn: boolean;
}

export default function UserMenu({ menuItems, isLoggedIn }: UserMenuProps) {
    const router = useRouter();
    return (
        <div>
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
                                <button type='button' onClick={() => router.push(item.link)} className='flex w-full'>
                                    {item.icon}
                                    {item.label}
                                </button>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    {isLoggedIn ? (
                        <DropdownMenuItem className='p-0'>
                            <LogoutButton />
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
