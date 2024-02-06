"use server"

export const getUserInsuranceProfile = async (userEmail: any, authToken: string) => {



    const url = process.env.BUNDEE_USER_EXIST_CONFIRMATION_API;
    

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: authToken,
        'Content-Type': 'application/json',

    };

    const body = {
        channelName:"Bundee",
        email:userEmail
    }

    try {
        const response = await fetch(url, {
            headers: headersList,
            method: 'POST',
            body: JSON.stringify(body),
            cache: 'no-cache',

        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();


        return {
            errorcode: data?.errorCode,
            insuranceName: data.driverProfiles[0]?.['insuranceCompany'],
            insuranceNumber: data.driverProfiles[0]?.['insuranceNumber'],
        };


    } catch (error) {
        console.error('Error fetching insurance data:', error);
        throw new Error('An error occurred while fetching insurance details');
    }
};
