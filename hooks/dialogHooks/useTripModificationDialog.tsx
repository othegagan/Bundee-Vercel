import { create } from 'zustand';

interface TripModificationDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    submitted: boolean;
    success: boolean;
    setSubmitted: (value: boolean) => void;
    setSuccess: (value: boolean) => void;
    message: string | null;
    setMessage: (value: string | null) => void;
}

const useTripModificationDialog = create<TripModificationDialogStore>((set) => ({
    isOpen: false,
    submitted: false,
    success: false,
    message: null,
    setSubmitted: (value) => set({ submitted: value }),
    setSuccess: (value) => set({ success: value }),
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setMessage: (value) => set({ message: value })
}));

export default useTripModificationDialog;
