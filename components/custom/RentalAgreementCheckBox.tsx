'use client';

import useDocumentDialog from '@/hooks/dialogHooks/useDocumentDialog';
import { updateRentalAgreement } from '@/server/tripOperations';
import { useState } from 'react';
import { Button } from '../ui/button';

export default function RentalAgreementCheckBox() {
    const documentDialog = useDocumentDialog();
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);

    const agreeToRentalAgreement = async () => {
        try {
            setLoading(true);
            const response: any = await updateRentalAgreement(documentDialog.tripId);
            if (response.success) {
                documentDialog.onClose();
                window.location.reload();
            } else {
                throw new Error('Error in updating agreement', response.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='mt-5 flex w-full  flex-col flex-wrap  gap-3'>
            <div className='items-top flex space-x-2 md:ml-20'>
                <input type='checkbox' id='terms1' className='accent-black size-5' checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <label htmlFor='terms1' className='text-sm font-medium leading-none tracking-normal flex  items-center gap-1'>
                    I have read and agree to <span className='hidden md:block text-black'>MyBundee's Rental</span> agreement.
                </label>
            </div>
            <div className=' flex flex-wrap items-center justify-end gap-3'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                        documentDialog.onClose();
                    }}>
                    Cancel
                </Button>
                <Button
                    type='button'
                    disabled={loading || !checked}
                    loading={loading}
                    onClick={() => {
                        agreeToRentalAgreement();
                    }}>
                    Agree
                </Button>
            </div>
        </div>
    );
}
