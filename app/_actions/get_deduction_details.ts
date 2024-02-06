"use server"

export const getDeductionDetails = async (userSelectedVehicleId: any, userID: any, token: string) => {

    const BaseURL = process.env.BOOKING_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/booking/DeductionConfigurationById';


    let accessToken = token || process.env.FALLBACK_BUNDEE_AUTH_TOKEN || '';

    if (token === 'undefined' || token === null || token === '' || token === undefined) {
        accessToken = process.env.FALLBACK_BUNDEE_AUTH_TOKEN || '';
    }

    const body = {
        fromValue: "alldetails",
        vehicleId: userSelectedVehicleId,
        id: userID
    }

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: accessToken,
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: headersList,
            cache: 'no-cache',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log('data.vehicleAllDetails :', data.vehicleAllDetails);

        return data?.deductionDetails[0]?.authorizationpercentage;

    } catch (error) {
        console.error('Error fetching the Deduction Details :', error);
        throw new Error('Error Fetching the deduction Details');
    }
};
