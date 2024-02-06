// Assuming 'use server' is a valid directive in your project environment
"use server"


export const getAllActiveTripsByUser = async (userId: any, bundee_auth_token: string) => {

    console.log("data" + userId, bundee_auth_token);

    const BaseURL = process.env.BOOKING_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/booking/getActiveTripById';

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        fromValue: "useridbookings",
        id: userId
    };

    console.log(JSON.stringify(body))

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
        console.log(data.activetripresponse[0]);
        return data.activetripresponse;



    } catch (error) {
        console.error('Error Creating new user:', error);
        throw new Error('Error Creating new user');
    }
};
