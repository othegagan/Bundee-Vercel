'use server';

import { getSession } from '@/lib/auth';
import { handleResponse, http } from '@/lib/httpService';

export async function updatePersonaProfile(personaEnquiryId: any) {
    try {
        const session = await getSession();
        const url = process.env.USER_MANAGEMENT_BASEURL + '/v1/user/createDriverProfile';
        const payload = {
            personaEnquiryId,
            userId: session.userId,
        };
        const response = await http.post(url, payload);
        if (response.data.errorCode == 0) {
            return {
                success: true,
                data: null,
                message: 'Persona  updated successfully',
            };
        } else {
            return {
                success: false,
                data: null,
                message: 'Failed to update Persona  ',
            };
        }
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
        const responseData = await response.json();
        console.log(responseData);

        const fields = responseData.data.attributes['fields'];

        let centerDriverPhotoUrl = null;
        let frontDrivingLicensePhotoUrl = null;

        if (Array.isArray(responseData.included)) {
            // Loop through each item in the included array
            for (const item of responseData.included) {
                // Check if the item type is verification/selfie
                if (item.type === 'verification/selfie') {
                    // Check if attributes and center-photo-url exist in the item
                    if (item.attributes && item.attributes['center-photo-url']) {
                        // Return the center-photo-url
                        centerDriverPhotoUrl = item.attributes['center-photo-url'];
                    }
                }

                // Check if the item type is verification/government-id
                if (item.type === 'verification/government-id') {
                    // Check if attributes and front-photo-url exist in the item
                    if (item.attributes && item.attributes['front-photo-url']) {
                        // Return the front-photo-url
                        frontDrivingLicensePhotoUrl = item.attributes['front-photo-url'];
                    }
                }
            }
        }

        return { fields, centerDriverPhotoUrl, frontDrivingLicensePhotoUrl };
    } catch (error) {
        console.error(error);
    }
};
