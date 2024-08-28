import { create } from 'zustand';

interface DrivingLicenceDialogStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onUpdate: (value: boolean) => void;
    isUpdate: boolean;
}

const useDrivingLicenceDialog = create<DrivingLicenceDialogStore>((set) => ({
    isOpen: false,
    isUpdate: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    onUpdate: (value: boolean) => set({ isUpdate: value })
}));

export default useDrivingLicenceDialog;
