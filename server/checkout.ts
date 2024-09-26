'use server';

import { getSession } from '@/lib/auth';
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

export async function logger(message: string, payload: any) {
    console.log(`${message} :`, payload);
}
