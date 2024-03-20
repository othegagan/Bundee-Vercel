import ErrorComponent from '@/components/custom/ErrorComponent';
import { getSession } from '@/lib/auth';
import TripDetailComponent from './TripDetailComponent';

export default async function TripDetailsPage({ params }: { params: { tripid: string } }) {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return <ErrorComponent message='Oops, it seems you are not logged in. Please log in.' />;
    }

    if (!Number(params.tripid)) {
        return <ErrorComponent />;
    }

    return <TripDetailComponent tripId={Number(params.tripid)} />;
}
