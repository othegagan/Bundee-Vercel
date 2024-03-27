'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';

export async function createPaymentIntentWithAmount(amount: number) {
    try {
        const session = await getSession();
        const url = process.env.CHAT_SERVICE_BASEURL + '/createIntentWithAmount';
        const payload = {
            email: session.email,
            amount: Math.ceil(amount),
            password: '535dff60664c8a624e056fb739e41e623b906daf3a59840f03613bbec19b6eb3',
        };

        const response = await http.post(url, payload);
        if (response.status == 200) {
            return {
                success: true,
                data: response.data,
                message: 'Payment intent created.',
            };
        } else {
            return {
                success: false,
                data: null,
                message: 'Failed to create Payment intent created.',
            };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function cancelPaymentIntent(vehicleid: number, amount: number, hostid: number, stripetoken: string, stripetokenid: any) {
    try {
        const session = await getSession();
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v1/booking/cancelPaymentIntent';
        const payload = {
            userid: session.userId,
            vehicleid: vehicleid,
            amount: amount,
            hostid: hostid,
            stripetoken: stripetoken,
            stripetokenid: stripetokenid,
            channelName: process.env.CHANNEL_NAME,
        };

        const response = await http.post(url, payload);
        return handleResponse(response);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripReservation(payload: any) {
    try {
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v1/booking/createReservation';
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        const response = await http.post(url, modifiedPayload);
        if (response.data.errorCode == 0) {
            return {
                success: true,
                data: response.data,
                message: 'Reservation created successfully',
            };
        } else {
            return {
                success: false,
                data: null,
                message: 'Failed to create Reservation',
            };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripExtension(payload: any) {
    try {
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v2/booking/createTripModificationExtension';
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        const response = await http.post(url, modifiedPayload);
        console.log(response.data)
        if (response.data.errorCode == 0) {
            return {
                success: true,
                data: response.data,
                message: 'Trip extension created successfully',
            };
        } else {
            return {
                success: false,
                data: null,
                message: 'Failed to create trip extension',
            };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripReduction(payload: any) {
    try {
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v2/booking/createTripModificationReduction';
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        const response = await http.post(url, modifiedPayload);
        console.log(response.data)
        if (response.data.errorCode == 0) {
            return {
                success: true,
                data: response.data,
                message: 'Trip reduction created successfully',
            };
        } else {
            return {
                success: false,
                data: null,
                message: 'Failed to create trip reduction',
            };
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}
