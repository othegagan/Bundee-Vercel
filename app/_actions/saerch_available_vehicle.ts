"use server"

export const getVehicleAllDetails = async (searchQuery: any, token: string) => {

    // console.log("Search Query", searchQuery);

    const url = process.env.AVAILABILITY_BASEURL + '/api/v1/availability/getByZipCode'

    let accessToken = token || process.env.FALLBACK_BUNDEE_AUTH_TOKEN;

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: accessToken,
        'Content-Type': 'application/json',
    };

    // console.log(url)
    try {
        // console.log("Started Searching...")
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(searchQuery),
            headers: headersList,
            cache: 'no-cache',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log('data.vehicleAllDetails :', data);

        return data.vehicleAllDetails;
    } catch (error) {
        console.error('Error fetching data of vehicleAllDetails :', error);
        throw new Error('An error occurred while fetching data.');
    }
    finally {
        // console.log(" Searching Stoped...")
    }
};
