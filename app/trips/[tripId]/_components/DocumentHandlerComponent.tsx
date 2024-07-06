'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from 'date-fns';
import React from 'react';
import useDocumentDialog from '@/hooks/dialogHooks/useDocumentDialog';

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
                variant='ghost'
                onClick={() => {
                    // console.log(tripData.rentalAgrrementUrl)
                    documentModal.setInvoicePDFLink(invoiceUrl);
                    documentModal.onOpen();
                }}>
                Download Invoice
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
