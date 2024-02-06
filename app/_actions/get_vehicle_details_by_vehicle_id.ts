"use server"

export const getVehicleAllDetailsByVechicleId = async (vehicleid: any, token: string) => {

    const url = `${process.env.BUNDEE_GET_VECHICLE_DETAILS_BY_VECHICLE_ID_URL}`;

    let accessToken = token || process.env.FALLBACK_BUNDEE_AUTH_TOKEN || '';

    if (token === 'undefined' || token === null || token === '' || token === undefined) {
        accessToken = process.env.FALLBACK_BUNDEE_AUTH_TOKEN || '';
    }
    
    const headersList = {
        Accept: '*/*',
        bundee_auth_token: accessToken,
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(vehicleid),
            headers: headersList,
            cache: 'no-cache',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;


    } catch (error) {
        console.error('Error fetching data of vehicleAllDetails :', error);
        throw new Error('An error occurred while fetching data.');
    }
};
