'use client';

import { Button } from '@/components/ui/button';
import useDocumentDialog from '@/hooks/dialogHooks/useDocumentDialog';
import { formatDate } from 'date-fns';

interface RentalAgreementHandlerProps {
    isRentalAgreed: boolean;
    tripId: number;
    rentalAgrrementUrl?: string | null;
    rentalAgreedDate?: string | null;
}

export function RentalAgreementHandler({ isRentalAgreed, rentalAgrrementUrl, rentalAgreedDate, tripId }: RentalAgreementHandlerProps) {
    const documentModal = useDocumentDialog();

    if (isRentalAgreed) {
        return (
            <Button
                variant='link'
                className='p-0 font-normal text-foreground text-md underline underline-offset-2'
                onClick={() => {
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
            className='p-0 font-normal text-foreground text-md underline underline-offset-2'
            onClick={() => {
                documentModal.setRentalAgreementPDFLink(rentalAgrrementUrl);
                documentModal.setTripId(tripId);
                documentModal.onOpen();
            }}>
            Accept
        </Button>
    );
}

export function InvoiceHandlerComponent({ invoiceUrl }: any) {
    const documentModal = useDocumentDialog();

    if (invoiceUrl) {
        return (
            <Button
                variant='link'
                className='p-0 font-normal text-foreground text-sm underline underline-offset-2'
                onClick={() => {
                    documentModal.setInvoicePDFLink(invoiceUrl);
                    documentModal.onOpen();
                }}>
                Download Invoice
            </Button>
        );
    }
}
