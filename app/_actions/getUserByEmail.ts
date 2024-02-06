'use server';

export const getUserByEmail = async (email: any, authToken: string) => {
    const url = process.env.USER_MANAGEMENT_BASEURL + '/api/v1/user/getUserByEmail';

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: authToken,
        'Content-Type': 'application/json',
    };

    const payload = {
        channelName: 'Bundee',
        email: email,
    };

    try {
        const response = await fetch(url, {
            headers: headersList,
            method: 'POST',
            body: JSON.stringify(payload),
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            errorcode: data?.errorCode,
            userData: data?.userResponse,
        };
    } catch (error) {
        console.error('Error fetching user existence data:', error);
        throw new Error('An error occurred while checking user existence.');
    }
};
