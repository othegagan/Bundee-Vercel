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

const BearerToken = 'Bearer persona_sandbox_46fd318d-52c7-45c6-a9db-b25f4102e689';

export const getVerifiedDetailsFromPersona = async (inquiryId: string) => {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'Persona-Version': '2023-01-05',
            authorization: BearerToken,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    };

    try {
        const response = await fetch(`https://withpersona.com/api/v1/inquiries/${inquiryId}`, options);
        const data = await response.json();
        const fields = data.data.attributes['fields'];
        return fields;

    } catch (error) {
        console.error(error);
    }
};
