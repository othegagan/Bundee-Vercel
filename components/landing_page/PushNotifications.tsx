'use client';

import useFcmToken from '@/hooks/useFCMToken';
import app from '@/lib/firebase';
import { getMessaging, onMessage } from 'firebase/messaging';

import { useEffect } from 'react';

export default function PushNotifications() {
    const { token, notificationPermissionStatus } = useFcmToken();

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            if (notificationPermissionStatus === 'granted') {
                const messaging = getMessaging(app);
                const unsubscribe = onMessage(messaging, (payload) => console.log('Foreground push notification received:', payload));
                return () => {
                    unsubscribe(); // Unsubscribe from the onMessage event on cleanup
                };
            }
        }
    }, [notificationPermissionStatus]);

    return null; // This component is primarily for handling foreground notifications
}
