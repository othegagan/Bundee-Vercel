'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';

export async function createPaymentIntentWithAmount(amount: number) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await getSession();

        let customerToken = '';
        let customers = await stripe.customers.list({
            email: session.email,
        });

        if (customers.data.length > 0) {
            customerToken = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: session.email,
            });
            customerToken = customer.id;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: 'USD',
            customer: customerToken,
            setup_future_usage: 'off_session',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
            capture_method: 'manual',
        });

        return paymentIntent;
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
        console.log(response.data);
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
        console.log(response.data);
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
        console.log(response.data);
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
