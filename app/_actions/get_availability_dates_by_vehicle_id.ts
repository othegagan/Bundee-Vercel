'use server';

export const getAvailabilityDatesByVehicleId = async (vehicleid: any, tripid: any, token: string) => {
    const url = `${process.env.BUNDEE_GET_AVAILABILITY_DATES_BY_VEHICLE_ID}`;

    let accessToken = token || process.env.FALLBACK_BUNDEE_AUTH_TOKEN || '';

    if (token === 'undefined' || token === null || token === '' || token === undefined) {
        accessToken = process.env.FALLBACK_BUNDEE_AUTH_TOKEN || '';
    }

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: accessToken,
        'Content-Type': 'application/json',
    };

    const payload = tripid
        ? {
              reservationId: tripid,
              vehicleId: vehicleid,
          }
        : { vehicleid: vehicleid };

    try {
        // console.log("Started fetching Availability Dates ")
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: headersList,
            cache: 'no-cache',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log('data.vehicleAllDetails :', data.vehicleAllDetails);
        return data;
    } catch (error) {
        console.error('Error fetching  Availability Dates :', error);
        throw new Error('An error occurred while fetching data.');
    } finally {
        // console.log("Finished fetching Availability Dates ")
    }
};
