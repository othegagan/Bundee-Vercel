"use server"

export const addToWishlist = async (userId: any, vehicleId: any,  bundee_auth_token: string) => {

    console.log("data" + userId, bundee_auth_token);

    const url = process.env.ADD_TO_WISHLIST;

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        userid: userId,
        vehicleid: vehicleId,
        isfavourite: true
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
        console.error('Error wishlisting vehicle items:', error);
        throw new Error('error wishlisting vehicle items');
    }
};
