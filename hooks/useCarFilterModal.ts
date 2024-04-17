import { create } from 'zustand';

interface CarFilterModalStore {
    isOpen: boolean;
    filteredCars: any;
    carDetails: any;
    appliedFiltersCount: number;
    onOpen: () => void;
    onClose: () => void;
    setFilteredCars: (data: any) => void;
    setCarDetails: (data: any) => void;
    setAppliedFiltersCount: (data: any) => void;
}

const useCarFilterModal = create<CarFilterModalStore>(set => ({
    isOpen: false,
    filteredCars: [],
    carDetails: [],
    appliedFiltersCount: 0,
    onOpen: () => {
        set({ isOpen: true });
    },
    onClose: () => set({ isOpen: false }),
    setFilteredCars: (filteredData: any) => {
        set({ filteredCars: filteredData });
    },
    setCarDetails: (data: any) => {
        set({ carDetails: data });
    },
    setAppliedFiltersCount: (count: number) => {
        set({ appliedFiltersCount: count });
    },
}));

export default useCarFilterModal;
