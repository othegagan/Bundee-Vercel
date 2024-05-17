'use client';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { deleteToken, getMessaging, getToken } from 'firebase/messaging';

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
const messaging = getMessaging(app);

export const auth = getAuth(app);
export { getToken, messaging };
export default app;


export function deleteTokenFromFirebase() {
    // Delete registration token.
    getToken(messaging)
        .then((currentToken: any) => {
            deleteToken(messaging)
                .then(() => {
                    console.log('Token deleted.');
                })
                .catch((err: any) => {
                    console.log('Unable to delete token. ', err);
                });
        })
        .catch((err: any) => {
            console.log('Error retrieving registration token. ', err);
        });
}
