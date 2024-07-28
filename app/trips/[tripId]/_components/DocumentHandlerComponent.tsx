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
                <FileDown className='text-neutral-400 size-4' /> Download Invoice
            </Button>
        );
    }

    if (isRentalAgreed) {
        return (
            <Button
                variant='link'
                className='p-0 text-md font-normal underline underline-offset-2 text-foreground'
                onClick={() => {
                    // console.log(tripData.rentalAgrrementUrl)
                    documentModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                    documentModal.setIsAgreementAcceptedOn(formatDate(new Date(rentalAgreedDate), 'PP, h:mm a'));
                    documentModal.onOpen();
                }}>
                View Rental Agreement
            </Button>
        );
    }

    return (
        <Button
            variant='link'
            className='p-0 text-md font-normal underline underline-offset-2 text-foreground'
            onClick={() => {
                // console.log(tripData.rentalAgrrementUrl)
                documentModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                documentModal.setTripId(tripId);
                documentModal.onOpen();
            }}>
            Accept
        </Button>
    );
}
