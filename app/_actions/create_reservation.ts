// Assuming 'use server' is a valid directive in your project environment
"use server"

export const createNewUser = async (body: any, bundee_auth_token: string) => {


    // CHAT_SERVICE_BASEURL = https://bundee-chatservice-dev.azurewebsites.net
    // USER_MANAGEMENT_BASEURL = https://bundeedevusermanagement.azurewebsites.net
    // HOST_SERVICES_BASEURL = https://bundeedevhostvehicle.azurewebsites.net
    // BOOKING_SERVICES_BASEURL = https://bundeedevbookings.azurewebsites.net
    // AVAILABILITY_BASEURL = https://bundeedevavailability.azurewebsites.net

    const BaseURL = process.env.BOOKING_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/booking/createReservation';

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
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

        return data;

    } catch (error) {
        console.error('Error creating resservation', error);
        throw new Error(error);
    }
};
