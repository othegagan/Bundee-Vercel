'use server';

export const callApi = async (personaEnquiryId: string, userId: string) => {
    try {
        const apiUrl = process.env.USER_MANAGEMENT_BASEURL;
        const response = await fetch(`${apiUrl}/api/v1/user/createDriverProfile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                bundee_auth_token: '51699e35f393ba8a7642c80a245e5b8aad4200c961fa8469bae0ef984cb95e95d9f3677ca9a32e1838cfbd897297ab2a',
            },
            body: JSON.stringify({
                personaEnquiryId,
                userId,
            }),
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.errorCode == 0 && data.driverProfiles.length > 0) {
            const res: any = {
                success: true,
                errorcode: data.errorCode,
            };
            return res;
        } else {
            const res: any = {
                success: false,
                errorcode: data.errorCode,
            };
            return res;
        }
    } catch (error) {
        console.error('API error:', error);
        throw new Error('Error In Catch Block');
    }
};
