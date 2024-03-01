"use server"

export const getUserExistOrNotConfirmation = async (getuserInfoData: any, authToken: string) => {

    const url = process.env.BUNDEE_USER_EXIST_CONFIRMATION_API;

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: authToken,
        'Content-Type': 'application/json',

    };

    try {
        const response = await fetch(url, {
            headers: headersList,
            method: 'POST',
            body: JSON.stringify(getuserInfoData),
            cache: 'no-cache',

        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();



        return {
            errorcode: data?.errorCode,
            isUserExist: data?.userResponse === null ? false : true,
            isPersonaVerified: data?.driverProfiles?.length == 0 ? false : true,
            userId: data?.userResponse?.iduser,
            personaEnquiryId: data?.driverProfiles?.length == 0 ? null : data?.driverProfiles[0]?.personaEnquiryId,
        };

    } catch (error) {
        console.error('Error fetching user existence data:', error);
        throw new Error('An error occurred while checking user existence.');
    }
};
