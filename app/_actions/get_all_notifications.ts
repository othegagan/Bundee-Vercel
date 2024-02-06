

"use server"

export const getAllNotifications = async (userId: string, bundeeAuthToken: string) => {
    // console.log("Fetching user notifications:", { userId, bundeeAuthToken });

    // Convert userId to a number
    const id = parseInt(userId, 10);


    if (isNaN(id)) {
        throw new Error('Invalid userId: Must be a convertible to a number');
    }

    const url = process.env.BUNDEE_GET_ALL_USER_NOTIFICATIONS_URL;

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundeeAuthToken,
        'Content-Type': 'application/json',

    };
    const body = {
        "id": id,
        "fromValue":"allusernotification"
        }

    // console.log(body);

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

        return data.inAppNotifications || [];

    } catch (error) {
        console.error('Error getting user notifications:', error);
        throw new Error('Error getting  user notifications ');
    }
};
