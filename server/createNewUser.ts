'use server';

import { http, handleResponse } from '@/lib/httpService';

export async function createNewUser({ firstname, lastname, email, mobilephone }) {
    try {
        const url = process.env.USER_MANAGEMENT_BASEURL + '/v1/user/createUser';

        const payload = {
            firstname: firstname,
            lastname: lastname || '',
            email: email,
            userRole: 'Driver',
            channelName: process.env.CHANNEL_NAME,
            mobilephone: mobilephone,
        };

        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
