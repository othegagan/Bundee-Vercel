// Assuming 'use server' is a valid directive in your project environment
"use server"

export const reservationCancel = async (tripId: any, bundee_auth_token: string) => {

    console.log("data" + tripId, bundee_auth_token);

    const url = process.env.BUNDEE_RESERVATION_CANCEL;

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        "tripid": tripId
    }

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
        console.error('Error cancelling the trip reservation:', error);
        throw new Error('Error cancelling the trip reservation');
    }
};
