import { create } from 'zustand';

interface DocumentModalStore {
    isOpen: boolean;
    tripId: number;
    isAgreementAcceptedOn: string;
    rentalAgreementPDFLink: string;
    invoicePDFLink: string;
    onOpen: () => void;
    onClose: () => void;
    setTripId: (tripId: number) => void;
    setIsAgreementAcceptedOn: (value: string) => void;
    setRentalAgreementPDFLink: (value: string) => void;
    setInvoicePDFLink: (value: string) => void;
}

const useDocumentModal = create<DocumentModalStore>(set => ({
    isOpen: false,
    tripId: 0,
    isAgreementAcceptedOn: '',
    rentalAgreementPDFLink: '',
    invoicePDFLink: '',
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setTripId: (tripId: number) => set({ tripId: tripId }),
    setIsAgreementAcceptedOn: (value: string) => set({ isAgreementAcceptedOn: value }),
    setRentalAgreementPDFLink: (value: string) => set({ rentalAgreementPDFLink: value }),
    setInvoicePDFLink: (value: string) => set({ invoicePDFLink: value }),
}));

export default useDocumentModal;
