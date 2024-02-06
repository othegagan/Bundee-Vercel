

"use server"

export const updateUserNotifications = async (notificationIds: string, bundeeAuthToken: string) => {
    console.log("Updating user notifications:", { userId: notificationIds, bundeeAuthToken });


    const url = process.env.BUNDEE_UPDATE_NOTIFICATION_URL;

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundeeAuthToken,
        'Content-Type': 'application/json',

    };
    const body = {
        "fromValue": notificationIds
    }

    console.log(body);

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
        console.error('Error updating user notifications:', error);
        throw new Error('Error updating user notifications');
    }
};
