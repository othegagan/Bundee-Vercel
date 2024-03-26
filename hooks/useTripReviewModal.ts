import { create } from 'zustand';

interface TripReviewModalStore {
    isOpen: boolean;
    tripData: any;
    onOpen: () => void;
    onClose: () => void;
    setTripData: (data: any) => void;
}

const useTripReviewModal = create<TripReviewModalStore>(set => ({
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

export default useTripReviewModal;
