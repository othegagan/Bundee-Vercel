import { getVehicleAllDetailsByVechicleId } from "@/server/vehicleOperations";
import { useQuery } from "@tanstack/react-query";

export const useVehicleDetails = (vehicleId: number | string) => {
    return useQuery({
        queryKey: ["vehicleDetails", { vehicleId }],
        queryFn: async () =>
            getVehicleAllDetailsByVechicleId(Number(vehicleId)),
        refetchOnWindowFocus: true,
        staleTime: 10 * 1000,
    });
};
