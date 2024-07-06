import { create } from 'zustand';

interface LoginDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useLoginDialog = create<LoginDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
}));

export default useLoginDialog;
