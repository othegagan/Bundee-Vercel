import { create } from 'zustand';

interface CarFilterDialogStore {
    isOpen: boolean;
    filteredCars: any;
    carDetails: any;
    appliedFiltersCount: number;
    isLoading: boolean;
    onOpen: () => void;
    onClose: () => void;
    setFilteredCars: (data: any) => void;
    setCarDetails: (data: any) => void;
    setAppliedFiltersCount: (data: any) => void;
    setIsLoading: (data: any) => void;
}

const useCarFilterDialog = create<CarFilterDialogStore>((set) => ({
    isOpen: false,
    filteredCars: [],
    carDetails: [],
    appliedFiltersCount: 0,
    isLoading: false,
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
    setIsLoading: (flag: boolean) => {
        set({ isLoading: flag });
    },
}));

export default useCarFilterDialog;
