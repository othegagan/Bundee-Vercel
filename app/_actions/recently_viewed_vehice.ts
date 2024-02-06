

"use server"

export const getAllRecentlyViewedVehicles = async (userId: string, bundeeAuthToken: string) => {
    console.log("Fetching Recently Viewed Vehicles:", { userId, bundeeAuthToken });

    // Convert userId to a number
    const id = parseInt(userId, 10);
    const key = "userId";

    if (isNaN(id)) {
        throw new Error('Invalid userId: Must be a convertible to a number');
    }

    const baseURL = process.env.HOST_SERVICES_BASEURL;

    const url = baseURL + '/api/v1/vehicle/getCustomerActivityById';

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundeeAuthToken,
        'Content-Type': 'application/json',

    };

    const body = {
        fromvalue: key,
        id: id
    };

    console.log(body);

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

        return data.customeractivityresponse || [];
    } catch (error) {
        console.error('Error getting Recently Viewed Vehicles:', error);
        throw new Error('Error in Recently viewed Vehicles');
    }
};
