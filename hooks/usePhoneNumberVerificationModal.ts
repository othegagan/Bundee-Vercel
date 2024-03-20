import { create } from 'zustand';

interface PhoneNumberVerificationModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const usePhoneNumberVerificationModal = create<PhoneNumberVerificationModalStore>(set => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
}));

export default usePhoneNumberVerificationModal;
