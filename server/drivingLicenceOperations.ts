"use server";

import { getSession } from "@/lib/auth";
import { handleResponse, http } from "@/lib/httpService";

export async function updateDrivingProfile(requestId: string) {
    try {
        const session = await getSession();
        const url = `${process.env.USER_MANAGEMENT_BASEURL}/v1/user/createDriverProfile`;
        const payload = {
            personaEnquiryId: requestId,
            userId: session.userId,
        };
        const response = await http.post(url, payload);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
