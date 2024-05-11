'use client';

import { getDeviceUUID, getSession, saveDeviceUUID } from '@/lib/auth';
import { messaging, vapidKey } from '@/lib/firebase';
import { updatePushNotificationToken } from '@/server/notifications';
import { getToken } from 'firebase/messaging';
import { useEffect } from 'react';

export default function PushNotifications() {
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

    const initializeNotifications = async () => {
        try {
            const session = await getSession();
            if (session.userId) {
                let uuid = await getDeviceUUID();
                // console.log('uuid', uuid);

                if (!uuid) {
                    await saveDeviceUUID();
                }

                uuid = await getDeviceUUID();
                // console.log('uuid', uuid);

                await requestPermission();
                const currentToken = await getToken(messaging, { vapidKey });
                console.log(currentToken);
                if (currentToken) {
                    // console.log(uuid);
                    // console.log(currentToken);

                    const response = await updatePushNotificationToken(uuid, currentToken);
                    console.log("Successfully updated push notification token");
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }
        } catch (err) {
            console.log('An error occurred:', err);
        }
    };

    useEffect(() => {
        initializeNotifications();
    }, []);
    return <></>;
}
