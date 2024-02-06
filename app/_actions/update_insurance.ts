// Assuming 'use server' is a valid directive in your project environment
"use server"

export const updateExistUserInsuranceProfile = async (body: any, bundee_auth_token: string) => {

    const baseUrl = process.env.USER_MANAGEMENT_BASEURL;
    
    const url = baseUrl + '/api/v1/user/createDriverProfile';

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
        if(data.errorCode == '0'){
            console.log("data updated successfully");
        }

        if(data.errorCode != '0'){
            console.log(data);
        }

        return {
            errorcode: data.errorCode,
            errorMessage: data.errorMessage
        };

    } catch (error) {
        console.error('Error updating insurance Profile', error);
        throw new Error('Error updating insurance Profile', error);
    }
};
