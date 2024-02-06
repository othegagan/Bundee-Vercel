// Assuming 'use server' is a valid directive in your project environment
"use server"

export const getAllHistoryTripsByUser = async (userId: any, bundee_auth_token: string) => {

    const BaseURL = process.env.BOOKING_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/booking/getActiveTripById';


    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token || process.env.FALLBACK_BUNDEE_AUTH_TOKEN,
        'Content-Type': 'application/json',
    };

    const body = {
        fromValue: "useridhistory",
        id: userId
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headersList,
            body: JSON.stringify(body),
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.activetripresponse;

    } catch (error) {
        console.error('Error getting history of trips:', error);
        throw new Error('Error getting history of trips:');
    }
};
