import { create } from 'zustand';

interface CardChangeDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useCardChangeDialog = create<CardChangeDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false })
}));

export default useCardChangeDialog;
