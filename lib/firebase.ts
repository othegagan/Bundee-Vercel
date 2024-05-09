import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';
import { getDeviceUUID, getSession, saveDeviceUUID } from './auth';
import { updatePushNotificationToken } from '@/server/notifications';

export const vapidKey = 'BD4_eKm3RLhQ0fyxTXnQ6eYnG1fogplCd8GppG_-wDG9bxsPf5M8t-y0h2WFp7OuomYxHb3vah2IgUIIzOcyq5k';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging();

export const auth = getAuth(app);
export { messaging, getToken };
export default app;

export const initializeNotifications = async () => {
    try {
        const session = await getSession();
        if (session.userId) {
            let uuid = await getDeviceUUID();
            console.log('uuid', uuid);

            if (!uuid) {
                await saveDeviceUUID();
            }

            uuid = await getDeviceUUID();

            await requestPermission();
            const currentToken = await getToken(messaging, { vapidKey });
            console.log(currentToken);
            if (currentToken) {
                console.log(uuid);
                console.log(currentToken);

                const response = await updatePushNotificationToken(uuid, currentToken);
                console.log(response);
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        }
    } catch (err) {
        console.log('An error occurred:', err);
    }
};

const requestPermission = () => {
    console.log('Requesting permission...');
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        } else {
            console.log('Unable to get permission to notify.');
        }
    });
};

