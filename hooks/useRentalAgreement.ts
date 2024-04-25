import { create } from 'zustand';

interface RentalAgreementModalStore {
    isOpen: boolean;
    tripId: number;
    isAgreemnetAcceptedOn: string;
    rentalAgreementPDFLink: string;
    onOpen: () => void;
    onClose: () => void;
    setTripId: (tripId: number) => void;
    setIsAgrrementAcceptedOn: (value: string) => void;
    setRentalAgreementPDFLink: (value: string) => void;
}

const useRentalAgreementModal = create<RentalAgreementModalStore>(set => ({
    isOpen: false,
    tripId: 0,
    isAgreemnetAcceptedOn: '',
    rentalAgreementPDFLink: '',
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setTripId: (tripId: number) => set({ tripId: tripId }),
    setIsAgrrementAcceptedOn: (value: string) => set({ isAgreemnetAcceptedOn: value }),
    setRentalAgreementPDFLink: (value: string) => set({ rentalAgreementPDFLink: value }),
}));

export default useRentalAgreementModal;
