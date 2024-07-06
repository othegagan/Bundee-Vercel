'use server';

import { getSession } from '@/lib/auth';
import { http, handleResponse } from '@/lib/httpService';

export async function createPaymentIntentWithAmount(amount: number, intent: string) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await getSession();

        let customerToken = '';
        const customers = await stripe.customers.list({
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

        // Retrieve the setup intent to get the payment method
        const setupIntent = await stripe.setupIntents.retrieve(intent);

        if (setupIntent.status !== 'succeeded') {
            throw new Error('Setup intent is not succeeded');
        }

        const paymentMethodId = setupIntent.payment_method;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.ceil(amount) * 100,
            currency: 'USD',
            customer: customerToken,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
        });

        console.log('Payment Intent created successfully:', paymentIntent.id);
        return paymentIntent;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createSetUpIntent() {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await getSession();

        let customerId = '';
        const customers = await stripe.customers.list({
            email: session.email,
        });

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: session.email,
            });
            customerId = customer.id;
        }

        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['card'],
            customer: customerId,
            description: 'Setup intent - ' + session.email,
            usage: 'off_session',
        });

        const client_secret = setupIntent.client_secret;

        return { client_secret, customerId };
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
        console.log(' CancelPaymentIntent response', response.data);
        return handleResponse(response);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripReservation(payload: any) {
    try {
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v1/booking/createReservation';
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        console.log('Reservation Payload :', modifiedPayload);
        const response = await http.post(url, modifiedPayload);
        console.log(' Reservation response', response.data);
        if (response.data.errorCode == 0) {
            return {
                success: true,
                data: response.data,
                message: 'Reservation created successfully' + response.data.errorMessage,
            };
        }
        return {
            success: false,
            data: null,
            message: 'Failed to create Reservation' + response.data.errorMessage,
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripExtension(payload: any) {
    try {
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v2/booking/createTripModificationExtension';
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        console.log('Trip extension Payload :', modifiedPayload);
        const response = await http.post(url, modifiedPayload);
        console.log(' Extension response', response.data);
        if (response.data.errorCode == 0) {
            return {
                success: true,
                data: response.data,
                message: 'Trip extension created successfully',
            };
        }
        return {
            success: false,
            data: null,
            message: 'Failed to create trip extension',
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripReduction(payload: any) {
    try {
        const url = process.env.BOOKING_SERVICES_BASEURL + '/v2/booking/createTripModificationReduction';
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        console.log('Trip reduction Payload :', modifiedPayload);
        const response = await http.post(url, modifiedPayload);
        console.log(' Reduction response', response.data);
        if (response.data.errorCode == 0) {
            return {
                success: true,
                data: response.data,
                message: 'Trip reduction created successfully',
            };
        }
        return {
            success: false,
            data: null,
            message: 'Failed to create trip reduction',
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}
