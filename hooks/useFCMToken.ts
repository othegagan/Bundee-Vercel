'use client';
import { getDeviceUUID, getSession, saveDeviceUUID } from '@/lib/auth';
import app, { vapidKey } from '@/lib/firebase';
import { updatePushNotificationToken } from '@/server/notifications';
import { getMessaging, getToken } from 'firebase/messaging';
import { useEffect, useState } from 'react';

const useFcmToken = () => {
    const [token, setToken] = useState('');
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('');

    useEffect(() => {
        const retrieveToken = async () => {
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

                    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                        const messaging = getMessaging(app);

                        // Request notification permission
                        const permission = await Notification.requestPermission();
                        setNotificationPermissionStatus(permission);

                        if (permission === 'granted') {
                            const currentToken = await getToken(messaging, {
                                vapidKey: vapidKey, // Replace with your Firebase project's VAPID key
                            });
                            if (currentToken) {
                                setToken(currentToken);
                                const callBackUrl = 'https://bundee-webdriver-qa.vercel.app/';
                                const response = await updatePushNotificationToken(uuid, currentToken, callBackUrl);
                                if (response.success) {
                                    console.log('Successfully updated push notification token');
                                } else {
                                    console.log('Failed to update push notification token');
                                }
                            } else {
                                console.log('No registration token available. Request permission to generate one.');
                            }
                        }
                    }
                }
            } catch (error) {
                console.log('Error retrieving token:', error);
            }
        };

        retrieveToken();
    }, []);

    return { token, notificationPermissionStatus };
};

export default useFcmToken;
