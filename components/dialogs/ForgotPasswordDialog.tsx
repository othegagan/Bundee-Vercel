'use client';

import useForgotPasswordDialog from '@/hooks/dialogHooks/useForgotPasswordDialog';
import useLoginDialog from '@/hooks/dialogHooks/useLoginDialog';
import { auth } from '@/lib/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const schema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }).optional(),
});

type FormFields = z.infer<typeof schema>;

export default function ForgotPasswordDialog() {
    const forgotPasswordDialog = useForgotPasswordDialog();
    const loginDialog = useLoginDialog();

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

    const onSubmit: SubmitHandler<FormFields | any> = async (data) => {
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
        forgotPasswordDialog.onOpen();
    }

    function closeModal() {
        reset();
        setErrorMessage('');
        setEmailSentTo('');
        setResetEmailSent(false);
        forgotPasswordDialog.onClose();
    }

    return (
        <Dialog
            title='Forgot Password'
            description=''
            isOpen={forgotPasswordDialog.isOpen}
            openDialog={() => {
                forgotPasswordDialog.onOpen();
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
                            loginDialog.onOpen();
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
                            loginDialog.onOpen();
                        }}>
                        Back to Log In
                    </button>
                </form>
            )}
            {errorMessage && <p className='mt-2 text-xs font-medium text-destructive'>{errorMessage}</p>}
        </Dialog>
    );
}
