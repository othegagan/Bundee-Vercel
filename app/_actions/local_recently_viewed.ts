// Vehicle interface definition
export interface Vehicle {
    make: string;
    model: string;
    year: number;
    image: string;
    price: number;
    tripCount: number;
}

// RecentlyViewedVehicles class definition
export class RecentlyViewedVehicles {
    private static readonly maxCount = 5;

    public static addVehicle(newVehicle: Vehicle) {
        const vehicles = this.getVehicles();
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
