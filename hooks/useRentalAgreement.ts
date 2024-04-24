import { create } from 'zustand';

interface RentalAgreementModalStore {
    isOpen: boolean;
    tripId: number;
    isAgreemnetAccepted: boolean;
    onOpen: () => void;
    onClose: () => void;
    setTripId: (tripId: number) => void;
    setIsAgrrementAccepted: (value: boolean) => void;
}

const useRentalAgreementModal = create<RentalAgreementModalStore>(set => ({
    isOpen: false,
    tripId: 0,
    isAgreemnetAccepted: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setTripId: (tripId: number) => set({ tripId: tripId }),
    setIsAgrrementAccepted: (value: boolean) => set({ isAgreemnetAccepted: value })
}));

export default useRentalAgreementModal;
