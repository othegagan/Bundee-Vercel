'use client';

import dynamic from 'next/dynamic';

const PDFViewerComponent = dynamic(() => import('../custom/PDFViewer'), {
    ssr: false,
});

import useRentalAgreementModal from '@/hooks/useRentalAgreement';
import { Download } from 'lucide-react';
import Link from 'next/link';
import RentalAgreementCheckBox from '../custom/RentalAgreementCheckBox';
import { Dialog, DialogBody } from '../ui/dialog';

const RentalAgreementModal = () => {
    const rentalAgreementModal = useRentalAgreementModal();

    const defaultRentalPdfLink = 'https://utfs.io/f/ea59485d-bd98-41bd-8148-3d12c334ca64-poy0k1.pdf';

    const uri = rentalAgreementModal.invoicePDFLink || rentalAgreementModal.rentalAgreementPDFLink || defaultRentalPdfLink;

    function openModal() {
        rentalAgreementModal.onOpen();
    }
    function closeModal() {
        rentalAgreementModal.setRentalAgreementPDFLink('');
        rentalAgreementModal.setInvoicePDFLink('');
        rentalAgreementModal.setIsAgreementAcceptedOn('');
        rentalAgreementModal.onClose();
    }

    return (
        <Dialog
            title={rentalAgreementModal.invoicePDFLink ? 'Invoice' : 'Rental Agreement '}
            isOpen={rentalAgreementModal.isOpen}
            closeDialog={closeModal}
            openDialog={openModal}
            className='lg:min-h-[500px] lg:max-w-4xl'>
            <DialogBody className='flex flex-col p-2   '>
                <PDFViewerComponent link={uri} />

                {rentalAgreementModal.invoicePDFLink ? (
                    <Link
                        href={rentalAgreementModal.invoicePDFLink}
                        download
                        className='ml-auto mt-4 flex w-fit cursor-pointer items-center justify-center gap-4 rounded-md bg-orange-400 px-10 py-2 text-center text-sm font-medium tracking-tight text-white'>
                        <Download className='size-4' /> Download Invoice
                    </Link>
                ) : (
                    <div>
                        {rentalAgreementModal.isAgreementAcceptedOn ? (
                            <label htmlFor='terms1' className='ml-6 mt-4 text-sm font-medium leading-none tracking-normal'>
                                MyBundee's Rental Agreement accepted on <br className='md:hidden' /> {rentalAgreementModal.isAgreementAcceptedOn}
                            </label>
                        ) : (
                            <RentalAgreementCheckBox />
                        )}
                    </div>
                )}
            </DialogBody>
        </Dialog>
    );
};

export default RentalAgreementModal;
