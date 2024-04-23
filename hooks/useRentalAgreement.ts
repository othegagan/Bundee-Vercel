import { create } from 'zustand';

interface RentalAgreementModalStore {
    isOpen: boolean;
    tripId: number;
    onOpen: () => void;
    onClose: () => void;
    setTripId: (tripId: number) => void;
}

const useRentalAgreementModal = create<RentalAgreementModalStore>(set => ({
    isOpen: false,
    tripId: 0,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setTripId: (tripId: number) => set({ tripId: tripId }),
}));

export default useRentalAgreementModal;
