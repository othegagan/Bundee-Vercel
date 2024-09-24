'use server';

import { getSession } from '@/lib/auth';
import { http } from '@/lib/httpService';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
    typescript: true
});

// method get last 4 difits of a card with stripe payment method id
export async function getCardLast4Digits(paymentMethodId: string) {
    try {
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        return paymentMethod.card.last4;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createSetUpIntent() {
    try {
        const session = await getSession();

        let customerId = '';
        const customers = await stripe.customers.list({
            email: session.email
        });

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: session.email
            });
            customerId = customer.id;
        }

        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['card'],
            customer: customerId,
            description: `Setup intent - ${session.email}`,
            usage: 'off_session'
        });

        const client_secret = setupIntent.client_secret;

        return { client_secret, customerId };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createTripReservation(payload: any) {
    try {
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v1/booking/createReservation`;
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        console.log('Reservation Payload :', modifiedPayload);
        const response = await http.post(url, modifiedPayload);
        console.log(' Reservation response', response.data);
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
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v2/booking/createTripModificationExtension`;
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        console.log('Trip extension Payload :', modifiedPayload);
        const response = await http.post(url, modifiedPayload);
        console.log(' Extension response', response.data);
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
        const url = `${process.env.BOOKING_SERVICES_BASEURL}/v2/booking/createTripModificationReduction`;
        const modifiedPayload = { ...payload, channelName: process.env.CHANNEL_NAME };
        console.log('Trip reduction Payload :', modifiedPayload);
        const response = await http.post(url, modifiedPayload);
        console.log(' Reduction response', response.data);
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
            message: 'Failed to create trip reduction'
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}
