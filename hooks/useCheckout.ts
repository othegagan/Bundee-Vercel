'use client';

import { http, handleResponse } from '@/lib/httpService';
import { logger } from '@/server/checkout';

export async function createTripReservation(payload: any) {
    try {
        const url = `${process.env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL}/v1/booking/createReservation`;
        console.log(url);
        const modifiedPayload = { ...payload, channelName: process.env.NEXT_PUBLIC_CHANNEL_NAME };

        // console.log('Reservation Payload', modifiedPayload);
        await logger('Reservation Payload', modifiedPayload);

        const response = await http.post(url, modifiedPayload);

        // console.log(' Reservation response', response.data);
        await logger('Reservation response', response.data);
        if (response.data.errorCode === '0') {
            return {
                success: true,
                data: response.data,
                message: `Reservation created successfully. ${response.data.errorMessage}`
            };
        }
        return {
            success: false,
            data: null,
            message: `Failed to create Reservation. ${response.data.errorMessage}`
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripExtension(payload: any) {
    try {
        const url = `${process.env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL}/v2/booking/createTripModificationExtension`;
        const modifiedPayload = { ...payload, channelName: process.env.NEXT_PUBLIC_CHANNEL_NAME };

        // console.log('Trip extension Payload :', modifiedPayload);
        await logger('Trip extension Payload :', modifiedPayload);

        const response = await http.post(url, modifiedPayload);

        // console.log(' Extension response', response.data);
        await logger('Trip extension response :', response.data);

        if (response.data.errorCode === '0') {
            return {
                success: true,
                data: response.data,
                message: 'Trip extension created successfully'
            };
        }
        return {
            success: false,
            data: null,
            message: 'Failed to create trip extension'
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripReduction(payload: any) {
    try {
        const url = `${process.env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL}/v2/booking/createTripModificationReduction`;
        const modifiedPayload = { ...payload, channelName: process.env.NEXT_PUBLIC_CHANNEL_NAME };

        // console.log('Trip reduction Payload :', modifiedPayload);
        await logger('Trip reduction Payload :', modifiedPayload);

        const response = await http.post(url, modifiedPayload);

        // console.log(' Reduction response', response.data);
        await logger('Trip reduction response :', response.data);

        if (response.data.errorCode === '0') {
            return {
                success: true,
                data: response.data,
                message: 'Trip reduction created successfully'
            };
        }
        return {
            success: false,
            data: null,
            message: `Failed to create trip reduction :${response.data.errorMessage}`
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function cancelReservation(tripid: number) {
    try {
        // console.log('Trip reduction Payload :', modifiedPayload);
        await logger('Trip Cancellation Payload  :', tripid);

        const url = `${process.env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL}/v1/booking/updateReservationCancelled`;
        const payload = {
            tripid: tripid
        };
        const response = await http.post(url, payload);
        // console.log('cancelReservation ', response.data);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
