import { create } from 'zustand';

interface TripReviewDialogStore {
    isOpen: boolean;
    tripData: any;
    onOpen: () => void;
    onClose: () => void;
    setTripData: (data: any) => void;
}

const useTripReviewDialog = create<TripReviewDialogStore>((set) => ({
    isOpen: false,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    tripData: null,
    setTripData: (data: any) => {
        set({ tripData: data });
    },
}));

export default useTripReviewDialog;
