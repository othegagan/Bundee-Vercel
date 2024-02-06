

"use server"

export const removeUserWishlistVehicle = async (userId: string, vehicleId: any, bundeeAuthToken: string) => {
    console.log("Fetching Recently Viewed Vehicles:", { userId, bundeeAuthToken });

    // Convert userId to a number
    const id = parseInt(userId, 10);

    if (isNaN(id)) {
        throw new Error('Invalid userId: Must be a convertible to a number');
    }

    const baseUrl = process.env.HOST_SERVICES_BASEURL;

    const url = baseUrl + '/api/v1/vehicle/updateCustomerWishList';


    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundeeAuthToken,
        'Content-Type': 'application/json',

    };

    const body = {
        userid: userId,
        vehicleid: vehicleId,
        isfavourite: false
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

        const res = data.errorCode == '0' ? "successfull" : "Fialed";
        
        console.log("unwishlsit " + res);


        return { code: data.errorCode };

    } catch (error) {
        console.error('Error unwishlisting vehicle', error);
        throw new Error("error unwishlisting vehicle", error);
    }
};
