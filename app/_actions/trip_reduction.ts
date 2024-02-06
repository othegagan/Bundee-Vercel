"use server"

export const tripReduction = async (data: {}, token: string) => {

    const BaseURL = process.env.BOOKING_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/booking/createTripModificationReduction';

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
            body: JSON.stringify(data),
            headers: headersList,
            cache: 'no-cache',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData;
        
    } catch (error) {
        console.error('Error in trip reduction :', error);
        throw new Error('An error occurred in trip reduction.');
    }
};
