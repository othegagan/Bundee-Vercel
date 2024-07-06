import { create } from 'zustand';

interface PhoneNumberSignInStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const usePhoneNumberSignInDialog = create<PhoneNumberSignInStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
}));

export default usePhoneNumberSignInDialog;
