import { NextRequest } from 'next/server';
import { getSession, updateSession } from './lib/auth';

export async function middleware(request: NextRequest) {
    // Get the session
    const session = await getSession();

    if (session?.userId && session.isLoggedIn) {
        // Update the session for logged in users
        return await updateSession(request);
    }
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
