import { Button } from '@/components/ui/button';
import { startTripByDriver } from '@/server/userOperations';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StartTripComponent({ starttime, tripid }) {
    const [tripStarting, setTripStarting] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const currentTime = Date.now();
            const tripStartTime = Number(starttime);
            const oneHourBeforeStart = tripStartTime - 1000 * 60 * 60;

            setShowButton(currentTime >= oneHourBeforeStart && currentTime < tripStartTime);
        };
        checkTime();
    }, [starttime]);

    const handleStartTrip = async () => {
        try {
            setTripStarting(true);
            const response = await startTripByDriver(Number(tripid));
            if (response.success) {
                window.location.reload();
            } else {
                toast.error('Something went wrong in starting the trip');
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error starting the trip', error);
        } finally {
            setTripStarting(false);
        }
    };

    if (!showButton) {
        return null;
    }

    return (
        <Button onClick={handleStartTrip} disabled={tripStarting} variant='green' size='lg'>
            {tripStarting ? <div className='loader' /> : 'Start trip'}
        </Button>
    );
}
