import { create } from 'zustand';

interface TripModificationModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useTripModificationModal = create<TripModificationModalStore>(set => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
}));

export default useTripModificationModal;
