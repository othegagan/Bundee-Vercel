'use client';
import useLoginDialog from '@/hooks/dialogHooks/useLoginDialog';
import useRegisterDialog from '@/hooks/dialogHooks/useRegisterDialog';
import { Button } from '../ui/button';

export default function LoginSignupButtons() {
    const loginDialog = useLoginDialog();
    const registerDialog = useRegisterDialog();
    return (
        <div className='flex select-none gap-4'>
            <Button
                onClick={() => {
                    loginDialog.onOpen();
                }}
                type='button'
                variant='outline'>
                Log In
            </Button>

            <Button
                onClick={() => {
                    registerDialog.onOpen();
                }}
                type='button'
                variant='black'>
                Sign Up
            </Button>
        </div>
    );
}
