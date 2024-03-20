'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';

export async function getBundeeToken(firebaseToken: string) {
    try {
        const url = process.env.USER_MANAGEMENT_BASEURL + '/v1/user/login';
        const payload = {
            authToken: firebaseToken,
        };

        const response = await http.post(url, payload);
        // console.log(response)
        return JSON.parse(JSON.stringify(response.data));
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getUserByEmail(email: string) {
    try {
        const url = process.env.USER_MANAGEMENT_BASEURL + '/v1/user/getUserByEmail';

        const payload = {
            channelName: process.env.CHANNEL_NAME,
            email: email,
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getRecentlyViewedVehicles() {
    try {
        const session = await getSession();
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/getCustomerActivityById';

        const payload = {
            fromvalue: 'userId',
            id: session.userId,
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function clearRecentlyViewedVehicles() {
    try {
        const session = await getSession();
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/softUpdateCustomerActivity';

        const payload = {
            userid: session.userId,
            isactive: false,
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function updateProfile(payload: any) {
    try {
        const url = process.env.USER_MANAGEMENT_BASEURL + '/v1/user/updateUser';

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function updateInsuranceProfile(payload: any) {
    try {
        const url = process.env.USER_MANAGEMENT_BASEURL + '/v1/user/createDriverProfile';

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function deleteAccount() {
    try {
        const session = await getSession();
        const url = process.env.USER_MANAGEMENT_BASEURL + '/v1/user/deleteUser';
        const payload = {
            email: session.email,
            iduser: Number(session.userId),
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function wishlistHandler(vehicleId: number, isfavourite: boolean) {
    try {
        const session = await getSession();
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/updateCustomerWishList';
        const payload = {
            userid: session.userId,
            vehicleid: vehicleId,
            isfavourite: isfavourite,
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function startTripByDriver(tripid: number) {
    try {
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v1/booking/updateReservationStart';
        const payload = {
            tripid: tripid,
            changedBy: 'USER',
            comments: 'Trip started from driver',
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
