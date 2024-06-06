import { SessionOptions } from 'iron-session';

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

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_KEY!,
    cookieName: 'bundee-session',
    cookieOptions: {
        httpOnly: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
    },
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
