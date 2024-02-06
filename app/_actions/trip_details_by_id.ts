// Assuming 'use server' is a valid directive in your project environment
"use server"

export const getTripDetailsbyId = async (bundee_auth_token: string, tripID: any) => {


    const baseURL = process.env.BOOKING_SERVICES_BASEURL;

    const url = baseURL + '/api/v1/booking/getActiveTripById';

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        fromValue: "tripid",
        id: tripID
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
        console.error('Error Fetching trip details', error);
        throw new Error('Error Fetching trip details');
    }
};
