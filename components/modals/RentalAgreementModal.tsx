'use client';

import useRentalAgreementModal from '@/hooks/useRentalAgreement';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import PDFViewer from '../custom/PDFViewer';
import RentalAgreementCheckBox from '../custom/RentalAgreementCheckBox';

const RentalAgreementModal = () => {
    const rentalAgreementModal = useRentalAgreementModal();

    const docs = [{ uri: 'https://utfs.io/f/ea59485d-bd98-41bd-8148-3d12c334ca64-poy0k1.pdf', fileType: 'pdf' }];

    function openModal() {
        rentalAgreementModal.onOpen();
    }
    function closeModal() {
        rentalAgreementModal.setIsAgrrementAcceptedOn('');
        rentalAgreementModal.onClose();
    }

    return (
        <Modal isOpen={rentalAgreementModal.isOpen} onClose={closeModal} className='lg:min-h-[500px] lg:max-w-4xl'>
            <ModalHeader onClose={closeModal}>{'Rental Agreement '}</ModalHeader>
            <ModalBody className={`  mb-0`}>
                <main className='flex flex-col p-2   '>
                    <PDFViewer docs={docs} />
                    {rentalAgreementModal.isAgreemnetAcceptedOn ? (
                        <label htmlFor='terms1' className='ml-6 text-sm font-medium leading-none tracking-normal'>
                            MyBundee's Rental Agreement accepted on {rentalAgreementModal.isAgreemnetAcceptedOn}
                        </label>
                    ) : (
                        <RentalAgreementCheckBox />
                    )}
                </main>
            </ModalBody>
        </Modal>
    );
};

export default RentalAgreementModal;
