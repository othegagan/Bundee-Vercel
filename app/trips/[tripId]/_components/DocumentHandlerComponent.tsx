'use client';

import { Button } from '@/components/ui/button';
import useDocumentDialog from '@/hooks/dialogHooks/useDocumentDialog';
import { formatDate } from 'date-fns';
import { FileDown } from 'lucide-react';
import React from 'react';

interface DocumentHandlerComponentProps {
    isRentalAgreed: boolean;
    tripId: number;
    rentalAgrrementUrl?: string | null;
    rentalAgreedDate?: string | null;
    invoiceUrl?: string | null;
}

export default function DocumentHandlerComponent({ isRentalAgreed, rentalAgrrementUrl, rentalAgreedDate, tripId, invoiceUrl }: DocumentHandlerComponentProps) {
    const documentModal = useDocumentDialog();

    if (invoiceUrl && isRentalAgreed) {
        return (
            <Button
            className='flex items-center gap-2 w-full  text-center mb-3 py-3'
                variant='outline'
                onClick={() => {
                    // console.log(tripData.rentalAgrrementUrl)
                    documentModal.setInvoicePDFLink(invoiceUrl);
                    documentModal.onOpen();
                }}>
                <FileDown className='text-neutral-400 size-4'/> Download Invoice
            </Button>
        );
    }

    if (isRentalAgreed) {
        return (
            <Button
                variant='ghost'
                onClick={() => {
                    // console.log(tripData.rentalAgrrementUrl)
                    documentModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                    documentModal.setIsAgreementAcceptedOn(formatDate(new Date(rentalAgreedDate), 'PP, h:mm a'));
                    documentModal.onOpen();
                }}
                className='font-medium leading-none tracking-wide underline underline-offset-2'>
                View Rental Agreement
            </Button>
        );
    }

    return (
        <Button
            size='lg'
            variant='outline'
            className='mt-6 w-full'
            onClick={() => {
                // console.log(tripData.rentalAgrrementUrl)
                documentModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                documentModal.setTripId(tripId);
                documentModal.onOpen();
            }}>
            Accept Rental Agreement
        </Button>
    );
}
