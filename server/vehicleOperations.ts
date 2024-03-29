'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';

export async function searchVehiclesAvailability(searchQuery: any) {
    try {
        const url = process.env.AVAILABILITY_BASEURL + '/v1/availability/getByZipCode';
        // console.log('Serach Payload', searchQuery);
        const response = await http.post(url, searchQuery);
        // console.log(response.data)
        return {
            data : response.data,
            success : true,
            message : ' Search done'
        }
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
            startdate: "2024-01-01",
            enddate: "2024-01-01",
            lattitude: "30.271129",
            longitude: "-97.7437",
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



export async function getTimeZoneIdentifier(zipCode) {
    const apiKey = 'DemoOnly00ZCOfg53PiTV4wUplRjU4CSyTAmQZyQiGG4DnbiTyBb8w4BofmuPydX';
    const apiUrl = `https://www.zipcodeapi.com/rest/${apiKey}/info.json/${zipCode}/degrees`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from ZIP code API');
        }
        const data = await response.json();
        if (!data.timezone || !data.timezone.timezone_identifier) {
            throw new Error('Time zone information not found for the provided ZIP code');
        }
        return data.timezone.timezone_identifier;
    } catch (error) {
        throw new Error(`Error fetching time zone for ZIP code ${zipCode}: ${error.message}`);
    }
}