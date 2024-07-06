'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { destroySession } from '@/lib/auth';
import { deleteAccount } from '@/server/userOperations';
import React, { useState } from 'react';

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
                await destroySession();
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
            <p className='mt-6 max-w-2xl text-sm leading-snug text-neutral-500'>
                We are sorry to see you go. Are you sure you want to delete your MyBundee account? Please be advised if you choose to proceed, your account
                closure will be irreversible.
            </p>

            <ul className='mt-4 list-inside list-disc'>
                <li>You will no longer be able to book trips.</li>
                <li>Any booked or pending trips will be cancelled immediately.</li>
                <li>You will no longer be able to login to your account.</li>
                <li>You are still financially responsible for any fees, claims, or reimbursements related to your past or pending trips.</li>
                <li>Any information associated with your account will not be publically viewable on our website and apps.</li>
            </ul>

            <div className='mt-5 flex justify-end'>
                <Button variant='destructive' onClick={() => openDialog()}>
                    Delete Account
                </Button>
            </div>
            <Dialog
                title='Confirm Account Deletion'
                description=''
                isOpen={open}
                openDialog={() => {
                    openDialog();
                }}
                closeDialog={() => {
                    closeDialog();
                }}>
                <DialogBody>
                    <p>Are you sure you want to delete your account?</p>
                </DialogBody>
                <DialogFooter>
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
                                <div className='loader' />
                            </div>
                        ) : (
                            <> Delete Account</>
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default DeleteAccountComponent;
