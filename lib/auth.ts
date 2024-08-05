"use server";
import "server-only";
import { type SessionData, defaultSession } from "@/types";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { JSONparsefy } from "./utils";
import { JWTExpired } from "jose/errors";

const secretKey = process.env.SECRET_KEY;
const cookieName =
    process.env.NODE_ENV === "production" ? "bundee-session" : "dev_session";
const EXPIRY_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const REFRESH_THRESHOLD_MS = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // Set expiration to 7 days
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        if (error instanceof JWTExpired) {
            throw error; // Re-throw JWTExpired to be caught in calling function
        }
        console.error("Error decrypting token:", error);
        throw new Error("Invalid token");
    }
}

interface CreateSessionProps {
    userData: any;
    authToken?: string;
}

export async function createSession({
    userData,
    authToken,
}: CreateSessionProps) {
    const expires = new Date(Date.now() + EXPIRY_IN_MS);

    const sessionData: SessionData = {
        email: userData?.email,
        isLoggedIn: true,
        userId: userData?.iduser,
        authToken: authToken,
        isPhoneVerified: false,
        isPersonaVerified: false,
    };

    // Create the session
    const session = await encrypt({ sessionData, expires: expires.getTime() });

    // Save the session in a cookie
    cookies().set(cookieName, session, {
        expires,
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
    });

    return sessionData;
}

export async function getSession(): Promise<SessionData> {
    const sessionCookie = cookies().get(cookieName)?.value;

    if (!sessionCookie) {
        return defaultSession;
    }

    try {
        const data = await decrypt(sessionCookie);
        const sessionData = JSONparsefy(data.sessionData) as SessionData;
        const expirationTime = new Date(data.expires);

        // Check if token needs refreshing
        if (Date.now() > expirationTime.getTime() - REFRESH_THRESHOLD_MS) {
            return await refreshSession(sessionData);
        }

        return sessionData;
    } catch (error) {
        if (error instanceof JWTExpired) {
            console.log("Session token has expired");
            await destroySession();
        } else {
            console.error("Error decrypting session:", error);
        }
        return defaultSession;
    }
}

async function refreshSession(sessionData: SessionData): Promise<SessionData> {
    console.log("Refreshing session");
    return await createSession({
        userData: sessionData,
        authToken: sessionData.authToken,
    });
}

export async function destroySession() {
    cookies().set(cookieName, "", {
        expires: new Date(0),
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
    });
}

export const saveDeviceUUID = async () => {
    const uuid = uuidv4();
    cookies().set("deviceUUID", uuid, {
        sameSite: "none",
        secure: true,
        path: "/",
        maxAge: 365 * 24 * 60 * 60, // 1 year
    });
    return uuid;
};

export const getDeviceUUID = async () => {
    const UUID = cookies().get("deviceUUID");
    if (UUID?.value) {
        return UUID.value;
    }
    return await saveDeviceUUID(); // If no UUID exists, create and save a new one
};

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get(cookieName)?.value;
    if (!session) return;

    try {
        const parsed = await decrypt(session);
        const newExpires = new Date(Date.now() + EXPIRY_IN_MS);
        parsed.expires = newExpires.getTime();

        const res = NextResponse.next();
        res.cookies.set({
            name: cookieName,
            value: await encrypt(parsed),
            httpOnly: true,
            expires: newExpires,
            sameSite: "none",
            secure: true,
            path: "/",
        });
        return res;
    } catch (error) {
        console.error("Error updating session:", error);
        // If there's an error, clear the invalid session
        const res = NextResponse.next();
        res.cookies.set({
            name: cookieName,
            value: "",
            httpOnly: true,
            expires: new Date(0),
            sameSite: "none",
            secure: true,
            path: "/",
        });
        return res;
    }
}
