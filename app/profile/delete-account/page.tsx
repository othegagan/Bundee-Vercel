import ErrorComponent from '@/components/custom/ErrorComponent';
import { getSession } from '@/lib/auth';
import DeletAccountComponent from './DeletAccountComponent';

export default async function profile() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return <ErrorComponent message='Oops, it seems you are not logged in. Please log in.' />;
    }

    return <DeletAccountComponent />;
}
