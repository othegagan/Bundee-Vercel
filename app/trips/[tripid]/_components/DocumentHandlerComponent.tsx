'use client';

import { Button } from '@/components/ui/button';
import useRentalAgreementModal from '@/hooks/useDocumentModal';
import { formatDate } from 'date-fns';
import React from 'react';

interface DocumentHandlerComponentProps {
    isRentalAgreed: boolean;
    tripId: number;
    rentalAgrrementUrl?: string | null;
    rentalAgreedDate?: string | null;
    invoiceUrl?: string | null;
}

export default function DocumentHandlerComponent({ isRentalAgreed, rentalAgrrementUrl, rentalAgreedDate, tripId, invoiceUrl }: DocumentHandlerComponentProps) {
    const rentalAgreementModal = useRentalAgreementModal();

    if (invoiceUrl && isRentalAgreed) {
        return (
            <Button
                variant='ghost'
                onClick={() => {
                    // console.log(tripData.rentalAgrrementUrl)
                    rentalAgreementModal.setInvoicePDFLink(invoiceUrl);
                    rentalAgreementModal.onOpen();
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
                    rentalAgreementModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                    rentalAgreementModal.setIsAgreementAcceptedOn(formatDate(new Date(rentalAgreedDate), 'PP, h:mm a'));
                    rentalAgreementModal.onOpen();
                }}
                className='font-medium leading-none tracking-wide underline underline-offset-2'>
                View Rental Agreement
            </Button>
        );
    } else {
        return (
            <Button
                size='lg'
                variant='outline'
                className='mt-6 w-full'
                onClick={() => {
                    // console.log(tripData.rentalAgrrementUrl)
                    rentalAgreementModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                    rentalAgreementModal.setTripId(tripId);
                    rentalAgreementModal.onOpen();
                }}>
                Accept Rental Agreement
            </Button>
        );
    }
}
