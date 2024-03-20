'use client';
import useLoginModal from '@/hooks/useLoginModal';
import useRegisterModal from '@/hooks/useRegisterModal';
import { Button } from '../ui/button';

export default function LoginSignupButtons() {
    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();
    return (
        <div className='flex select-none gap-4'>
            <Button
                onClick={() => {
                    loginModal.onOpen();
                }}
                type='button'
                variant='outline'>
                Login
            </Button>

            <Button
                onClick={() => {
                    registerModal.onOpen();
                }}
                type='button'
                variant='black'>
                Sign Up
            </Button>
        </div>
    );
}
