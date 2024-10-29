import ErrorComponent from '@/components/custom/ErrorComponent';
import { getSession } from '@/lib/auth';
import ChangePasswordComponent from './ChangePasswordComponent';

export default async function page() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return <ErrorComponent message='Oops, it seems you are not logged in. Please log in.' />;
    }

    return <ChangePasswordComponent />;
}
