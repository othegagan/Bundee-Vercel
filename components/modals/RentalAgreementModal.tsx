'use client';

import useRentalAgreementModal from '@/hooks/useRentalAgreement';
import { updateRentalAgreement } from '@/server/tripOperations';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import ClientOnly from '../ClientOnly';
import { Modal, ModalBody, ModalHeader } from '../custom/modal';
import { Button } from '../ui/button';
import DocViewer, { DocViewerRenderers, IHeaderOverride } from '@cyntler/react-doc-viewer';

const RentalAgreementModal = () => {
    const router = useRouter();
    const rentalAgreementModal = useRentalAgreementModal();
    const termsRef = useRef(null);
    const [isAgreed, setIsAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const docs = [{ uri: './rental_agreement.pdf', fileType: 'pdf' }];

    const handleScroll = () => {
        const termsElement = termsRef.current;
        const { scrollHeight, scrollTop, clientHeight } = termsElement;
        // Check if user scrolled to the bottom with a tolerance of 1 pixel
        if (scrollHeight - scrollTop <= clientHeight + 1) {
            setIsAgreed(true);
        }
    };

    const agreeToRentalAgreement = async () => {
        try {
            setLoading(true);
            const response: any = await updateRentalAgreement(rentalAgreementModal.tripId);
            console.log(response);
            if (response.success) {
                closeModal();
                router.refresh();
            } else {
                throw new Error('Error in updating agreement', response.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    function openModal() {
        rentalAgreementModal.onOpen();
    }
    function closeModal() {
        setIsAgreed(false);
        rentalAgreementModal.onClose();
    }

    return (
        <Modal isOpen={rentalAgreementModal.isOpen} onClose={closeModal} className='lg:min-h-[500px] lg:max-w-4xl'>
            <ModalHeader onClose={closeModal}>{'Rental Agreement '}</ModalHeader>
            <ModalBody className={`  mb-0 transition-all delay-1000 ${!rentalAgreementModal.isOpen ? ' rotate-90' : ' rotate-0'}`}>
                <ClientOnly>
                    <main className='flex flex-col p-2   '>
                        <DocViewer
                            documents={docs}
                            pluginRenderers={DocViewerRenderers}
                            prefetchMethod='GET'
                            style={{ width: '100%', height: 450, margin: 'auto' }}
                            config={{
                                header: {
                                    disableHeader: true,
                                    disableFileName: true,
                                    retainURLParams: false,
                                },
                                csvDelimiter: ',', // "," as default,
                                pdfZoom: {
                                    defaultZoom: 1.2, // 1 as default,
                                    zoomJump: 0.2, // 0.1 as default,
                                },
                                pdfVerticalScrollByDefault: true, // false as default
                            }}
                        />
                        <div className='mt-5 flex w-full items-center justify-end gap-3'>
                            <Button type='button' variant='outline'>
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                disabled={!isAgreed || loading}
                                onClick={() => {
                                    agreeToRentalAgreement();
                                }}>
                                {loading ? <div className='loader'></div> : 'Agree'}
                            </Button>
                        </div>
                    </main>
                </ClientOnly>
            </ModalBody>
        </Modal>
    );
};

export default RentalAgreementModal;
