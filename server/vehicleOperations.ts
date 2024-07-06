'use server';

import { getSession } from '@/lib/auth';
import { http, handleResponse } from '@/lib/httpService';

export async function searchVehiclesAvailability(searchQuery: any) {
    try {
        const url = process.env.AVAILABILITY_BASEURL + '/v1/availability/getByZipCode';
        // console.log('Serach Payload', searchQuery);
        const response = await http.post(url, searchQuery);
        // console.log(response.data)
        return {
            data: response.data,
            success: true,
            message: ' Search done',
        };
        // return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function searchVehiclesByLatitudeAndLongitude(searchQuery: any) {
    try {
        const url = process.env.AVAILABILITY_BASEURL + '/v1/availability/searchVehiclesByLatitudeAndLongitude';
        // console.log('Serach Payload', searchQuery);
        const response = await http.post(url, searchQuery);
        // console.log(response.data)
        return {
            data: response.data,
            success: true,
            message: ' Search done',
        };
        // return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getVehicleAllDetailsByVechicleId(vechicleId: number) {
    try {
        const session = await getSession();
        const url = process.env.AVAILABILITY_BASEURL + '/v1/availability/getVehiclesnFeaturesById';
        const payload = {
            vehicleid: vechicleId,
            userId: session.userId || '',
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function addToRecentlyViewedHistory(vehicleid: number) {
    try {
        const session = await getSession();
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/updateCustomerActivity';
        const payload = {
            userid: session.userId || '',
            vehicleid: vehicleid,
            startdate: '2024-01-01',
            enddate: '2024-01-01',
            lattitude: '30.271129',
            longitude: '-97.7437',
        };
        // console.log(payload)
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getAvailabilityDatesByVehicleId(vehicleid: number, tripid: number) {
    try {
        const url = process.env.AVAILABILITY_BASEURL + '/v1/availability/getAvailabilityDatesByVehicleId';
        const payload = tripid
            ? {
                  reservationId: tripid,
                  vehicleid: vehicleid,
              }
            : { vehicleid: vehicleid };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
