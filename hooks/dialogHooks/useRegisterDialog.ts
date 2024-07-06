import { create } from 'zustand';

interface RegisterDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useRegisterDialog = create<RegisterDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

export default useRegisterDialog;
