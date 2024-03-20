'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';

export async function searchVehiclesAvailability(searchQuery: any) {
    try {
        const url = process.env.AVAILABILITY_BASEURL + '/v1/availability/getByZipCode';
        // console.log('Serach Payload', searchQuery);
        const response = await http.post(url, searchQuery);
        return handleResponse(response.data);
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

export async function addToRecentlyViewedHistory(vechicleId: number) {
    try {
        const session = await getSession();
        const url = process.env.HOST_SERVICES_BASEURL + '/v1/vehicle/updateCustomerActivity';
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

export async function getAvailabilityDatesByVehicleId(vehicleid: number, tripid: number) {
    try {
        const session = await getSession();
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
