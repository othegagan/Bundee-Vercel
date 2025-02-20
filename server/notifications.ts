'use server';

import { getSession } from '@/lib/auth';
import { http, handleResponse } from '@/lib/httpService';

export async function getAllNotifications(pageNumber = 1) {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v2/booking/inAppNotificationsForDriver`;
        const payload = {
            id: session.userId,
            fromValue: 'allusernotification',
            pageNumber: pageNumber
        };

        const response = await http.post(url, payload);
        // console.log(response)
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function checkForNotifications() {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/userHasNotification`;
        const payload = {
            userId: session?.userId
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function markAllNotificationAsRead() {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/markUserNotificationAsRead`;
        const payload = {
            userId: session?.userId
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function markNotificationAsRead(notificationIds: any) {
    try {
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/updateNotification`;
        const payload = {
            fromValue: notificationIds
        };

        const response = await http.post(url, payload);
        // console.log(response)
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function updatePushNotificationToken(deviceUUID: string, deviceToken: string, callBackUrl: string) {
    try {
        const session = await getSession();
        const url = `${process.env.USER_MANAGEMENT_BASEURL}/v1/user/updatePushNotification`;
        const payload = { userid: session.userId, deviceUUID: deviceUUID, devicetoken: deviceToken, callBackUrl };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
