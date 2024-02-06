"use server"

export const clearAllRecentlyViewedVehicle = async (userId: any, bundee_auth_token: string) => {

    console.log("data" + userId, bundee_auth_token);

    const BaseURL = process.env.HOST_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/vehicle/softUpdateCustomerActivity';

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        userid: userId,
        isactive: false,
    };

    console.log(JSON.stringify(body))

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
            success : data.errorCode == '0' ? true : false
        }

        console.log(res);
        return res



    } catch (error) {
        console.error('Error removing recently viewed vehicle:', error);
        throw new Error('error wishlisting recently viewed vehicle');
    }
};
