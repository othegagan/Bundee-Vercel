

"use server"

export const swapRequest = async (body: {}, bundeeAuthToken: string) => {


    const url = process.env.BUNDEE_SWAP_REQUEST_URL;

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundeeAuthToken,
        'Content-Type': 'application/json',
    };

    console.log("swap request body",body);

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
        console.error('Error rejecting swap request:', error);
        throw new Error('Error rejecting swap request');
    }
};
