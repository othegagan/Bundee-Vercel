'use server';

import { v4 as uuidv4 } from 'uuid';
import { defaultSession, type SessionData } from '@/types';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { JSONparsefy } from './utils';

const secretKey = process.env.SECRET_KEY;
const cookieName = process.env.NODE_ENV === 'production' ? 'bundee-session' : 'dev_session';
const EXPIRY_IN_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('12h').sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

interface CreateSessionProps {
    userData: any;
    authToken?: string;
}

export async function createSession({ userData, authToken }: CreateSessionProps) {
    const expires = new Date(Date.now() + EXPIRY_IN_MS);

    const sessionData = {
        email: userData?.email,
        isLoggedIn: true,
        userId: userData?.iduser,
        authToken: authToken,
    };

    // Create the session
    const session = await encrypt({ sessionData, expires });

    // Save the session in a cookie
    cookies().set(cookieName, session, {
        expires,
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
}

export async function getSession() {
    const sessionCookie = cookies().get(cookieName)?.value;

    if (!sessionCookie) {
        return defaultSession;
    }

    const data = await decrypt(sessionCookie);

    return JSONparsefy(data.sessionData) as SessionData;
}

export async function destroySession() {
    // Destroy the session
    cookies().set(cookieName, '', { expires: new Date(0), path: '/' });
}

export const saveDeviceUUID = async () => {
    const cookieStore = cookies();
    const uuid = uuidv4();
    cookieStore.set('deviceUUID', uuid, {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
};

export const getDeviceUUID = async () => {
    const cookieStore = cookies();
    const UUID = cookieStore.get('deviceUUID');
    return UUID?.value || null;
};

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get(cookieName)?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + EXPIRY_IN_MS);

    const res = NextResponse.next();
    res.cookies.set({
        name: cookieName,
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
    return res;
}
