import { create } from 'zustand';

interface ForgotPasswordDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useForgotPasswordDialog = create<ForgotPasswordDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
}));

export default useForgotPasswordDialog;
