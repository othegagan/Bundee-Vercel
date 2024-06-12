'use client';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const vapidKey = 'BPXlh9OQxe4gIUZ5gdWrsahfxY8Eu4cxaDn4osuW72ysoyg13swUrwVlNZNz82WVTQrjvVd53STe723itTZ3jVY';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;

export function getFirebaseErrorMessage(code: string) {
    const errorMap = {
        'auth/user-not-found': 'User account not found.',
        'auth/wrong-password': 'Incorrect password. Try again.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/too-many-requests': 'Too many requests. Please try again later.',
        'auth/user-disabled': 'Account has been disabled.',
        'auth/missing-password': 'Please enter your password.',
        'auth/invalid-credential': 'Invalid Credentials. Please try again.',
        'auth/argument-error': 'Invalid argument. Please check your input and try again.',
        'auth/invalid-phone-number': 'Invalid phone number. Please enter a valid phone number.',
        'auth/invalid-login-credentials': 'Invalid Credentials. Please try again.',
        default: 'An error occurred. Please try again.',
    };
    return errorMap[code] || errorMap.default;
}
