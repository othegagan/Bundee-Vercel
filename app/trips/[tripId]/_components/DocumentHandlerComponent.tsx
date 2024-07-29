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
                variant='link'
                className='p-0 text-sm font-normal underline underline-offset-2 text-foreground'
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
                variant='link'
                className='p-0 text-md font-normal underline underline-offset-2 text-foreground'
                onClick={() => {
                    // console.log(tripData.rentalAgrrementUrl)
                    documentModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                    documentModal.setIsAgreementAcceptedOn(formatDate(new Date(rentalAgreedDate), 'PP, h:mm a'));
                    documentModal.onOpen();
                }}>
                View
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
