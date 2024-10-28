'use client';

import useDocumentDialog from '@/hooks/dialogHooks/useDocumentDialog';
import { formatDate } from 'date-fns';

interface RentalAgreementHandlerProps {
    isRentalAgreed: boolean;
    tripId: number;
    rentalAgreementUrl?: string | null;
    rentalAgreedDate?: string | null;
}

export function RentalAgreementHandler({ isRentalAgreed, rentalAgreementUrl, rentalAgreedDate, tripId }: RentalAgreementHandlerProps) {
    const documentModal = useDocumentDialog();

    if (isRentalAgreed) {
        return (
            <button
                type='button'
                className='p-0 font-normal text-foreground text-md underline underline-offset-2'
                onClick={() => {
                    documentModal.setRentalAgreementPDFLink(rentalAgreementUrl);
                    documentModal.setIsAgreementAcceptedOn(formatDate(new Date(rentalAgreedDate), 'PP, h:mm a'));
                    documentModal.onOpen();
                }}>
                View
            </button>
        );
    }

    return (
        <button
            type='button'
            className='p-0 font-normal text-foreground text-md underline underline-offset-2'
            onClick={() => {
                documentModal.setRentalAgreementPDFLink(rentalAgreementUrl);
                documentModal.setTripId(tripId);
                documentModal.onOpen();
            }}>
            Accept
        </button>
    );
}

export function InvoiceHandlerComponent({ invoiceUrl }: any) {
    const documentModal = useDocumentDialog();

    if (invoiceUrl) {
        return (
            <button
                type='button'
                className='p-0 font-normal text-foreground text-sm underline underline-offset-2'
                onClick={() => {
                    documentModal.setInvoicePDFLink(invoiceUrl);
                    documentModal.onOpen();
                }}>
                Download Invoice
            </button>
        );
    }
}
