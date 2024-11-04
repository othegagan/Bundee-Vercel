import { http } from '@/lib/httpService';
import { create } from 'zustand';

interface PhoneNumberVerificationDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    phoneNumber: string;
    setPhoneNumber: (number: string) => void;
    authToken?: string;
    setAuthToken?: (token: string) => void;
    userId?: number;
    setUserId?: (userId: number) => void;
}

const usePhoneNumberVerificationDialog = create<PhoneNumberVerificationDialogStore>((set) => ({
    isOpen: false,
    phoneNumber: '',
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setPhoneNumber: (phoneNumber: string) => {
        set({ phoneNumber: phoneNumber });
    }
}));

const useFirstPhoneNumberVerificationDialog = create<PhoneNumberVerificationDialogStore>((set) => ({
    isOpen: false,
    phoneNumber: '',
    authToken: '',
    userId: 0,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setPhoneNumber: (phoneNumber: string) => {
        set({ phoneNumber: phoneNumber });
    },
    setAuthToken: (token: string) => {
        set({ authToken: token });
    },
    setUserId: (userId: number) => {
        set({ userId: userId });
    }
}));

async function checkPhoneNumberAsLinked(phoneNumber: string) {
    try {
        const url = `${process.env.NEXT_PUBLIC_AUXILIARY_SERVICE_BASEURL}checkPhoneLinkedToAnyUser?phoneNumber=`;
        const urlEncoded = encodeURIComponent(phoneNumber);
        const combinedUrl = url + urlEncoded;
        const response = await http.get(combinedUrl);
        return response.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export { usePhoneNumberVerificationDialog, useFirstPhoneNumberVerificationDialog, checkPhoneNumberAsLinked };
