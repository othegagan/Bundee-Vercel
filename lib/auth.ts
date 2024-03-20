'use server';

import { SessionData, defaultSession, sessionOptions } from '@/types';
import { getIronSession, SessionOptions } from 'iron-session';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const getSession = async () => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }
    const sessionData = JSON.parse(JSON.stringify(session)) as SessionData;
    return sessionData;
};

interface loginSessionProps {
    userData: any;
    authToken?: string;
}

export const login = async ({ userData, authToken }: loginSessionProps) => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.email = userData?.email;
    session.isLoggedIn = true;
    session.userId = userData?.iduser;
    session.authToken = authToken;
    //@ts-ignore
    await session.save();
};

export const logout = async () => {
    try {
        const session = await getIronSession<SessionData>(cookies(), sessionOptions);
        //@ts-ignore
        session.destroy();
        redirect('/');
    } catch (error) {
        console.log(error);
    }
};

// export const changeUsername = async (formData: FormData) => {
//     const session = await getSession();

//     const newUsername = formData.get('username') as string;

//     username = newUsername;

//     session.username = username;
//     await session.save();
//     revalidatePath('/profile');
// };
