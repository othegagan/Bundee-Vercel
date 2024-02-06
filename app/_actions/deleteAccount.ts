'use server';

export const deleteAccount = async (userId: any, email: any, bundee_auth_token: any) => {
    const BaseURL = process.env.USER_MANAGEMENT_BASEURL;

    const url = BaseURL + '/api/v1/user/deleteUser';

    console.log(url);
    const headersList = {
        Accept: '*/*',
        bundee_auth_token: bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        email: email,
        iduser: Number(userId),
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
        const res = {
            success: data.errorCode == '0' ? true : false,
        };
        return res;
    } catch (error) {
        console.error('Error Deleteing Account', error);
        throw new Error('error Deleteing account');
    }
};
