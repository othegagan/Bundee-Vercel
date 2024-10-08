'use client';

import dynamic from 'next/dynamic';

const PDFViewerComponent = dynamic(() => import('../custom/PDFViewer'), {
    ssr: false
});

import useDocumentDialog from '@/hooks/dialogHooks/useDocumentDialog';
import { Download } from 'lucide-react';
import Link from 'next/link';
import RentalAgreementCheckBox from '../custom/RentalAgreementCheckBox';
import { Dialog, DialogBody } from '../ui/dialog';

export default function DocumentDialog() {
    const documentModal = useDocumentDialog();

    const defaultRentalPdfLink = 'https://utfs.io/f/ea59485d-bd98-41bd-8148-3d12c334ca64-poy0k1.pdf';

    const uri = documentModal.invoicePDFLink || documentModal.rentalAgreementPDFLink || defaultRentalPdfLink;

    function openModal() {
        documentModal.onOpen();
    }
    function closeModal() {
        documentModal.setRentalAgreementPDFLink('');
        documentModal.setInvoicePDFLink('');
        documentModal.setIsAgreementAcceptedOn('');
        documentModal.onClose();
    }

    return (
        <Dialog
            title={documentModal.invoicePDFLink ? 'Invoice' : 'Rental Agreement '}
            isOpen={documentModal.isOpen}
            closeDialog={closeModal}
            openDialog={openModal}
            className='lg:min-h-[500px] lg:max-w-4xl'>
            <DialogBody className='flex flex-col '>
                <div className='h-[70dvh] w-full'>
                    <PDFViewerComponent url={uri} />
                </div>

                {documentModal.invoicePDFLink ? (
                    <Link
                        href={documentModal.invoicePDFLink}
                        download
                        className='mt-4 ml-auto flex w-fit cursor-pointer items-center justify-center gap-4 rounded-md bg-orange-400 px-10 py-2 text-center font-medium text-sm text-white tracking-tight'>
                        <Download className='size-4' /> Download Invoice
                    </Link>
                ) : (
                    <div>
                        {documentModal.isAgreementAcceptedOn ? (
                            <label htmlFor='terms1' className='mt-4 ml-6 font-medium text-sm leading-none tracking-normal'>
                                MyBundee's Rental Agreement accepted on <br className='md:hidden' /> {documentModal.isAgreementAcceptedOn}
                            </label>
                        ) : (
                            <RentalAgreementCheckBox />
                        )}
                    </div>
                )}
            </DialogBody>
        </Dialog>
    );
}
