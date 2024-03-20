import ErrorComponent from '@/components/custom/ErrorComponent';
import { getSession } from '@/lib/auth';
import TripsComponent from './TripsComponent';

export default async function Trips() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return <ErrorComponent message='Oops, it seems you are not logged in. Please log in.' />;
    }

    return <TripsComponent />;
}
