import { create } from 'zustand';

interface TripModificationDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useTripModificationDialog = create<TripModificationDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
}));

export default useTripModificationDialog;
