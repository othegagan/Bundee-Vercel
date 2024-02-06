"use server"

export const addToRecentlyViewedHistory = async (userId: any, vehicleId: any,  bundee_auth_token: string) => {

    // console.log("data" + userId, bundee_auth_token);

    const url = process.env.ADD_RECENTLY_VIEWED_HISOTRY;

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        userid: Number(userId),
        vehicleid: vehicleId,
        startdate: "2024-01-01",
        enddate: "2024-01-01",
        lattitude: "30.271129",
        longitude: "-97.7437",
    };

    // console.log("add to recenlty viewed",JSON.stringify(body))

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

        return res


    } catch (error) {
        console.error('Error adding recenlty viewed vehicle', error);
        throw new Error('Error adding recenlty viewed vehicle');
    }
};
