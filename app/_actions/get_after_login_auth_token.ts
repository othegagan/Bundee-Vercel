"use server"

export const initializeAuthTokensAfterLogin = async (authToken: string) => {
    console.log(authToken);

    let accessToken = authToken || process.env.INITIAL_TOKEN_DUMMY;

    const bodyData = {
        authToken: accessToken
    };

    const url = process.env.USER_MANAGEMENT_BASEURL + "/api/v1/user/login";
    console.log(url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(response.status);
        const data = await response.json();
        console.log(data);

        // Assuming the response includes a new authToken
        console.log(data.authToken);

        return data.authToken; 

    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('An error occurred while fetching data: ' + error.message);
    }
};
