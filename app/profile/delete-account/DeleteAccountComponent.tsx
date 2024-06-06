'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { deleteAccount } from '@/server/userOperations';
import { toast } from '@/components/ui/use-toast';
import { logout } from '@/lib/auth';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';

const DeleteAccountComponent = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const openDialog = () => setOpen(true);
    const closeDialog = () => setOpen(false);

    const deleteUser = async () => {
        setLoading(true);
        try {
            const response = await deleteAccount();
            if (response.success) {
                localStorage.clear();
                await logout();
            } else {
                closeDialog();
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    description: 'Failed to delete the account',
                });
            }
        } catch (error) {
            toast({
                duration: 4000,
                variant: 'destructive',
                description: 'Failed to delete the account',
            });
            console.log('Failed to delete the account', error);
        } finally {
            closeDialog();
            setLoading(false);
        }
    };

    return (
        <div>
            <p className='mt-12 text-base font-semibold'>
                The account will be permanently deleted, including all your data associated with the account. This action is irreversible and can not be undone.
            </p>
            <div className='mt-5 flex justify-end'>
                <Button variant='destructive' onClick={() => openDialog()}>
                    <> Delete Account </>
                </Button>
            </div>

            <ResponsiveDialog
                title='Confirm Account Deletion'
                description=''
                isOpen={open}
                openDialog={() => {
                    openDialog();
                }}
                closeDialog={() => {
                    closeDialog();
                }}>
                <p>Are you sure you want to delete your account?</p>
                <div className='flex gap-4 justify-end'>
                    <Button
                        variant='outline'
                        className='mt-3'
                        onClick={() => {
                            closeDialog();
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
                            <> Delete Account</>
                        )}
                    </Button>
                </div>
            </ResponsiveDialog>
        </div>
    );
};

export default DeleteAccountComponent;
