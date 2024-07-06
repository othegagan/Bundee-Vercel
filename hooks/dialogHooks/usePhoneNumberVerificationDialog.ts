import { create } from 'zustand';

interface PhoneNumberVerificationDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const usePhoneNumberVerificationDialog = create<PhoneNumberVerificationDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
}));

export default usePhoneNumberVerificationDialog;
