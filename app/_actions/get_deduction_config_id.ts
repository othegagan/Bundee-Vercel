// Assuming 'use server' is a valid directive in your project environment
"use server"


export const getDeductionConfigById = async (vehicleId: any, hostId: any, bundee_auth_token: string) => {

    console.log("data" + vehicleId, bundee_auth_token);

    const url = process.env.BUNDEE_DEDUCTION_CONFIG_ID;

    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        "fromValue": "alldetails",
        "vehicleId": vehicleId,
        "id": hostId
    }

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
        console.log(data.activetripresponse[0]);
        return data.deductionDetails;



    } catch (error) {
        console.error('error gettin deduction config' , error);
        throw new Error('Error getting deduciton config', error);
    }
};
