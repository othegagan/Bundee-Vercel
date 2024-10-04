'use server';

import { getSession } from '@/lib/auth';
import { http, handleResponse } from '@/lib/httpService';

export async function getTrips(fromValue: string) {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/getActiveTripById`;
        const payload = {
            fromValue: fromValue || 'useridbookings',
            id: session.userId
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getTripDetailsbyId(tripid: number) {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/getActiveTripById`;
        const payload = {
            fromValue: 'tripid',
            id: tripid
        };
        const response = await http.post(url, payload);

        const tripResponse = handleResponse(response.data);

        if (tripResponse.success) {
            const userIdInResponse = tripResponse.data.activetripresponse[0].userid;
            if (userIdInResponse !== session.userId) {
                return {
                    success: false,
                    data: null,
                    message: 'Unauthorized access..!'
                };
            }
        }
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function updateRentalAgreement(tripid: number) {
    try {
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/updateRentalAgreement`;
        const payload = {
            tripId: tripid,
            isRentalAgreed: true
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function swapRequest(payload: any) {
    try {
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/createSwapRequest`;
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function endReservation(tripid: number) {
    try {
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/updateReservationCompleted`;
        const payload = {
            tripid: tripid,
            comments: '',
            paymentCategoryId: '',
            captureAmount: 0,
            changedBy: 'USER'
        };
        console.log('payload', payload);
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getTripChatHistory(tripid: number, firebaseToken: string) {
    try {
        const url = `${process.env.CHAT_SERVICE_BASEURL}/getAllChatHistory`;

        const headersList = {
            Accept: '*/*',
            Authorization: `Bearer ${firebaseToken}`,
            'Content-Type': 'application/json'
        };

        const payload = {
            tripId: Number(tripid),
            count: 1000
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headersList,
            body: JSON.stringify(payload),
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const messageData = data.messages
            .map((item: any) => ({
                author: item.author,
                message: item.body,
                deliveryDate: item.dateUpdated // Adjust as needed
            }))
            .reverse();

        return messageData;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function sendMessageToHost(tripid: number, messageBody: string, firebaseToken: string) {
    try {
        const url = `${process.env.CHAT_SERVICE_BASEURL}/clientSendMessage`;

        const headersList = {
            Accept: '*/*',
            Authorization: `Bearer ${firebaseToken}`,
            'Content-Type': 'application/json'
        };

        const payload = {
            tripId: tripid,
            message: messageBody
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headersList,
            body: JSON.stringify(payload),
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const res_client = {
            success: true
        };

        return res_client;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function deleteImageVideoUploaded(id: number) {
    try {
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/deleteMediaFile`;
        const payload = {
            id
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function addTripReview(hostId: number, tripId: number, rating: number, comments: string, vehicleId: number) {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/createTripReview`;
        const payload = {
            hostID: hostId,
            tripid: tripId,
            rating: rating,
            comments: comments,
            userId: session.userId,
            vehicleid: vehicleId,
            reservationID: tripId
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function changeCardForTrip(tripid: number, paymentMethodIDToken: string) {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/changeCard`;
        const payload = {
            tripid: tripid,
            paymentMethodIDToken: paymentMethodIDToken
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getDriverSpecificTripOnDashboard() {
    try {
        const session = await getSession();
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/getDriverSpecificTrips`;
        const payload = {
            userId: session.userId
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
