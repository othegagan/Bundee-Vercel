'use client';
import { deleteAccount } from '@/app/_actions/deleteAccount';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DeleteAccount = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const deleteUser = async () => {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const bundee_auth_token = localStorage.getItem('auth_token_login');
        const email = localStorage.getItem('session_user');
        try {
            await deleteAccount(userId, email, bundee_auth_token).then(res => {
                if (res) {
                    localStorage.clear();
                    window.location.href = '/';
                } else {
                    setOpen(false);
                    alert('Failed to delete the account');
                }
            });
        } catch (error) {
            alert('Failed to delete the account');
            console.log('Failed to delete the account', error);
        } finally {
            setOpen(false);
            setLoading(false);
        }
    };
    return (
        <div>
            <p className='mt-12 font-semibold text-base'>
                The account will be permanently deleted, including all your data associated with the account. This action is irreversible and can not be undone.
            </p>
            <div className='flex justify-end mt-5'>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant='destructive'>
                            <p> Delete Account </p>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Account Deletion</DialogTitle>
                            <DialogDescription>Are you sure you want to delete your account?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <div className='flex gap-3 lg:flex-row flex-col'>
                                <Button
                                    variant='outline'
                                    className='mt-3'
                                    onClick={() => {
                                        setOpen(false);
                                    }}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        deleteUser();
                                    }}
                                    disabled={loading}
                                    variant='destructive'
                                    className='mt-3'>
                                    {loading ? (
                                        <div className='flex px-16'>
                                            <div className='loader'></div>
                                        </div>
                                    ) : (
                                        <div> Delete Account</div>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default DeleteAccount;
