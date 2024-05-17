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
