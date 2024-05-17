'use client';

import { getDeviceUUID, getSession, saveDeviceUUID } from '@/lib/auth';
import { requestForToken } from '@/lib/firebase';
import { isSupported } from 'firebase/messaging';
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

                await requestForToken(uuid);
            }
        } catch (err) {
            console.log('An error occurred:', err);
        }
    };

    useEffect(() => {
        (async () => {
            const hasFirebaseMessagingSupport = await isSupported();
            if (hasFirebaseMessagingSupport) {
                initializeNotifications();
            }
        })();
    }, []);
    return <></>;
}
