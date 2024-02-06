// Assuming 'use server' is a valid directive in your project environment
"use server"

export const createNewUser = async (body: any, bundee_auth_token: string) => {

    const BaseURL = process.env.USER_MANAGEMENT_BASEURL;

    const url = BaseURL + '/api/v1/user/createUser';

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

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
        return {
            errorcode: data.errorCode,
            userId: data.userResponses[0].iduser
        };

    } catch (error) {
        console.error('Error Creating new user:', error);
        throw new Error('Error Creating new user');
    }
};
