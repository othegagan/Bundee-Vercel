'use client';

import useForgotPasswordModal from '@/hooks/useForgotPasswordModal';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { z } from 'zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '../ui/button';
import { useState } from 'react';
import useLoginModal from '@/hooks/useLoginModal';
import { Dialog } from '../ui/dialog';

const schema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }).optional(),
});

type FormFields = z.infer<typeof schema>;

export default function ForgotPasswordModal() {
    const forgotPasswordModal = useForgotPasswordModal();
    const loginModal = useLoginModal();

    const [resetMailSent, setResetEmailSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [emailSentTo, setEmailSentTo] = useState('');

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onSubmit',
    });

    const onSubmit: SubmitHandler<FormFields | any> = async data => {
        try {
            const email = data.email as string;
            setErrorMessage('');
            setEmailSentTo(email);

            const result = await sendPasswordResetEmail(auth, email);
            setResetEmailSent(true);
        } catch (error: any) {
            setEmailSentTo('');
            console.log(error);
            setErrorMessage(error.message);
            setResetEmailSent(false);
        }
    };

    function openModal() {
        forgotPasswordModal.onOpen();
    }

    function closeModal() {
        reset();
        setErrorMessage('');
        setEmailSentTo('');
        setResetEmailSent(false);
        forgotPasswordModal.onClose();
    }

    return (
        <Dialog
            title='Forgot Password'
            description=''
            isOpen={forgotPasswordModal.isOpen}
            openDialog={() => {
                forgotPasswordModal.onOpen();
            }}
            closeDialog={() => {
                closeModal();
            }}
            onInteractOutside={true}
            className='lg:max-w-lg'>
            {resetMailSent ? (
                <div className='flex w-full flex-col gap-y-2'>
                    <p>
                        An Email containing the password reset link has been shared to your email <span className='font-bold'>{emailSentTo}</span>
                    </p>
                    <Button
                        onClick={() => {
                            closeModal();
                            loginModal.onOpen();
                        }}
                        variant='secondary'
                        className='ml-auto mt-6'>
                        Back to login
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='flex flex-col gap-y-2'>
                        <Label htmlFor='email'>
                            Your Email address <span>*</span>
                        </Label>
                        <div className='mt-1'>
                            <Input id='email' {...register('email')} placeholder='name@example.com' />
                            <p className='mt-2 text-xs font-medium text-destructive'>{errors.email?.message}</p>
                        </div>

                        <Button type='submit' className='mt-3 w-full' disabled={isSubmitting} loading={isSubmitting} loadingText='Sending...'>
                            Get Password Reset Link
                        </Button>
                    </div>

                    <button
                        type='button'
                        className='mt-4 w-fit cursor-pointer hover:underline'
                        onClick={() => {
                            closeModal();
                            loginModal.onOpen();
                        }}>
                        Back to Log In
                    </button>
                </form>
            )}
            {errorMessage && <p className='mt-2 text-xs font-medium text-destructive'>{errorMessage}</p>}
        </Dialog>
    );
}
