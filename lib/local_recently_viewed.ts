// Vehicle interface definition
export interface Vehicle {
    vehicleId: String
    make: string;
    model: string;
    year: number;
    image: string;
    price: number;
    tripCount: number;
}
// RecentlyViewedVehicles class definition
export class RecentlyViewedVehicles {
    private static readonly maxCount = 4;

    public static addVehicle(newVehicle: Vehicle) {
        let vehicles = this.getVehicles();

        // Check if the vehicle already exists
        const existingIndex = vehicles.findIndex(v => v.vehicleId === newVehicle.vehicleId);

        if (existingIndex >= 0) {
            // If the vehicle exists, remove the old entry
            vehicles.splice(existingIndex, 1);
        }

        // Add the new (or re-viewed) vehicle to the end
        vehicles.push(newVehicle);

        // Maintain FIFO order and limit
        while (vehicles.length > RecentlyViewedVehicles.maxCount) {
            vehicles.shift(); // Remove the oldest vehicle
        }

        // Store in local storage
        localStorage.setItem('recentlyViewedVehicles', JSON.stringify(vehicles));
    }

    public static getVehicles(): Vehicle[] {
        const vehiclesString = localStorage.getItem('recentlyViewedVehicles');
        return vehiclesString ? JSON.parse(vehiclesString) : [];
    }

    // Optionally, a method to clear all recently viewed vehicles
    public static clearVehicles() {
        localStorage.removeItem('recentlyViewedVehicles');
    }
}

