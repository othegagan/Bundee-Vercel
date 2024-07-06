'use server';

import { getSession } from '@/lib/auth';
import { http, handleResponse } from '@/lib/httpService';

export async function calculatePrice(payload: any) {
    try {
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/calculatePrice';
        // console.log('Serach Payload', searchQuery);
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function calculatePriceForTripExtension(payload: any) {
    try {
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/calculatePriceForExtension';
        // console.log('Serach Payload', searchQuery);
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function calculatePriceForTripReduction(payload: any) {
    try {
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/calculatePriceForReduction';
        // console.log('Serach Payload', searchQuery);
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
