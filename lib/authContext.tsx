'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/app/auth/firebase';
import { initializeAuthTokensAfterLogin } from '@/app/_actions/get_after_login_auth_token';
import { getUserByEmail } from '@/app/_actions/getUserByEmail';
import { createNewUser } from '@/app/_actions/create_new_user';

interface AuthContextProps {
    user: any | null;
    googleSignIn: () => void;
    logOut: () => void;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    googleSignIn: () => {},
    logOut: () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async result => {
                // Handle successful sign-in
                console.log(result.user);

                const firebaseToken = await result.user.getIdToken();

                const tokenAfterLogin = await initializeAuthTokensAfterLogin(firebaseToken);
                localStorage.setItem('auth_token_login', tokenAfterLogin);

                const bundeeAuthToken = localStorage.getItem('bundee_auth_token');
                const { errorcode, userData } = await getUserByEmail(result.user.email, bundeeAuthToken);

                const callbackUrl = localStorage.getItem('authCallbackSuccessUrl');

                if (errorcode == '1') {
                    const dataToCreateUser = {
                        firstname: result.user.displayName,
                        lastname: '',
                        email: result.user.email,
                        userRole: 'Driver',
                        channelName: 'Bundee',
                        mobilephone: result.user.phoneNumber,
                    };
                    const bundee_auth_token = localStorage.getItem('bundee_auth_token');

                    const data = await createNewUser(dataToCreateUser, bundee_auth_token);

                    if (data.errorcode == '0') {
                        localStorage.setItem('session_user', result.user.email);
                        localStorage.setItem('userId', data.userId);
                        if (callbackUrl && callbackUrl.includes('/auth/signup')) {
                            window.location.replace('/');
                        } else {
                            window.location.replace(callbackUrl || '/');
                        }
                    } else {
                        throw new Error('Unable to create user');
                    }
                } else {
                    localStorage.setItem('session_user', userData?.email || '');
                    localStorage.setItem('userId', userData.iduser);

                    if (callbackUrl && callbackUrl.includes('/auth/signup')) {
                        window.location.replace('/');
                    } else {
                        window.location.replace(callbackUrl || '/');
                    }
                }

            })
            .catch(error => {
                // Handle sign-in error
                console.log(error.message);
                logOut();
            });
    };

    const logOut = () => {
        signOut(auth)
            .then(() => {
                // Handle successful sign-out
            })
            .catch(error => {
                // Handle sign-out error
            });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ user, googleSignIn: googleSignIn, logOut }}>{children}</AuthContext.Provider>;
};

export const useUserAuth = () => {
    return useContext(AuthContext);
};
