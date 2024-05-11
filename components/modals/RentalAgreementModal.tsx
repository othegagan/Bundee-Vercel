'use client';

import useRentalAgreementModal from '@/hooks/useRentalAgreement';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import PDFViewer from '../custom/PDFViewer';
import RentalAgreementCheckBox from '../custom/RentalAgreementCheckBox';
import Link from 'next/link';
import { Download } from 'lucide-react';

const RentalAgreementModal = () => {
    const rentalAgreementModal = useRentalAgreementModal();

    const uri = rentalAgreementModal.invoicePDFLink || rentalAgreementModal.rentalAgreementPDFLink;

    const docs = [{ uri: uri || 'https://utfs.io/f/ea59485d-bd98-41bd-8148-3d12c334ca64-poy0k1.pdf', fileType: 'pdf' }];

    function openModal() {
        rentalAgreementModal.onOpen();
    }
    function closeModal() {
        rentalAgreementModal.setRentalAgreementPDFLink('');
        rentalAgreementModal.setInvoicePDFLink('');
        rentalAgreementModal.setIsAgrrementAcceptedOn('');
        rentalAgreementModal.onClose();
    }

    return (
        <Modal isOpen={rentalAgreementModal.isOpen} onClose={closeModal} className='lg:min-h-[500px] lg:max-w-4xl'>
            <ModalHeader onClose={closeModal}>{rentalAgreementModal.invoicePDFLink ? 'Invoice' : 'Rental Agreement '}</ModalHeader>
            <ModalBody className={`  mb-0`}>
                <main className='flex flex-col p-2   '>
                    <PDFViewer docs={docs} />
                    {rentalAgreementModal.invoicePDFLink ? (
                        <Link
                            href={rentalAgreementModal.invoicePDFLink}
                            download
                            className='ml-auto mt-4 flex w-fit cursor-pointer items-center justify-center gap-4 rounded-md bg-orange-400 px-10 py-2 text-center text-sm font-medium tracking-tight text-white'>
                            <Download className='size-4' /> Download Invoice
                        </Link>
                    ) : (
                        <div>
                            {rentalAgreementModal.isAgreemnetAcceptedOn ? (
                                <label htmlFor='terms1' className='ml-6 mt-4 text-sm font-medium leading-none tracking-normal'>
                                    MyBundee's Rental Agreement accepted on <br className='md:hidden' /> {rentalAgreementModal.isAgreemnetAcceptedOn}
                                </label>
                            ) : (
                                <RentalAgreementCheckBox />
                            )}
                        </div>
                    )}
                </main>
            </ModalBody>
        </Modal>
    );
};

export default RentalAgreementModal;
