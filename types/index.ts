
export interface SessionData {
    userId: number | null;
    email: string;
    isLoggedIn: boolean;
    isPhoneVerified: boolean;
    isPersonaVerified: boolean;
    authToken?: string;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
    email: '',
    userId: null,
    isPhoneVerified: false,
    isPersonaVerified: false,
    authToken: '',
};


export interface Vehicle {
    vehicleId: String;
    make: string;
    model: string;
    year: number;
    image: string;
    price: number;
    tripCount: number;
}
