'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';

export async function updatePersonaProfile(personaEnquiryId: any) {
    try {
        const session = await getSession();
        const url = process.env.USER_MANAGEMENT_BASEURL + '/api/v1/user/createDriverProfile';
        const payload = {
            personaEnquiryId,
            userId: session.userId,
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const getVerifiedDetailsFromPersona = async (inquiryId: string) => {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'Persona-Version': '2023-01-05',
            authorization: `Bearer ${process.env.PERSONA_BEARER_TOKEN}`,
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
