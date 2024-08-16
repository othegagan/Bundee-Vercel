"use server";

import { getSession } from "@/lib/auth";
import { handleResponse, http } from "@/lib/httpService";

export async function updateDrivingProfile(requestId: string, userID: number) {
    try {
        const session = await getSession();
        const url = `${process.env.USER_MANAGEMENT_BASEURL}/v1/user/createDriverProfile`;
        const payload = {
            userId: userID || session.userId,
            idScanRequestID: requestId,
            isVerified: true,
        };

        console.log("createDriverProfile payload", payload);

        const response = await http.post(url, payload);
        console.log("create driver profile response", response.data);
        return handleResponse(response.data);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
