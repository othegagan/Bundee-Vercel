

"use server"

export const startTripByDriver = async (body: {}, bundeeAuthToken: string) => {


    const url = process.env.BOOKING_SERVICES_BASEURL + '/api/v1/booking/updateReservationStart';

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundeeAuthToken,
        'Content-Type': 'application/json',
    };

    // console.log("Start Trip request body",body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headersList,
            body: JSON.stringify(body),
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.error('Error starting the trip:', error);
        throw new Error('Error starting the trip');
    }
};
