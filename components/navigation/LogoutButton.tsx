import { destroySession } from '@/lib/auth';
import { TbLogout2 } from 'react-icons/tb';

export default function LogoutButton() {
    return (
        <>
            <form action={destroySession} className='w-full px-2 py-1'>
                <button className='w-full' type='submit'>
                    <div className='flex items-center gap-2 text-sm font-medium'>
                        <TbLogout2 className='mr-2 h-4 w-4' />
                        Log out
                    </div>
                </button>
            </form>
        </>
    );
}
