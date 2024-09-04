import { Button } from '@/components/ui/button';
import { formatDateAndTime } from '@/lib/utils';
import { startTripByDriver } from '@/server/userOperations';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Add a grace period of 1 hour before the trip start time
const GRACE_PERIOD = 1000 * 60 * 60; // 1 hour in milliseconds

export default function StartTripComponent({ starttime, tripid, zipCode }: { starttime: string; tripid: string; zipCode: string }) {
    const [tripStarting, setTripStarting] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const currentTime = Date.now();
            // console.log('currentTime', new Date(currentTime));

            const convertedToVehicleTimeZone = formatDateAndTime(starttime, zipCode, 'YYYY-MM-DDTHH:mm:ss');
            // console.log('Converted Start Time:', convertedToVehicleTimeZone);


            const tripStartTime = Date.parse(convertedToVehicleTimeZone);

            // Validate the parsed start time
            if (Number.isNaN(tripStartTime)) {
                // console.error('Invalid starttime format:', starttime);
                setShowButton(false);
                return;
            }

            // console.log('tripStartTime', tripStartTime);

            // Calculate the time one hour before the trip start time
            const oneHourBeforeStart = tripStartTime - GRACE_PERIOD;
            // console.log('oneHourBeforeStart', oneHourBeforeStart);

            // Determine if the button should be shown:
            // show button if current time is greater than or equal to one hour before start
            setShowButton(currentTime >= oneHourBeforeStart);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [starttime, zipCode]);

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
        return null; // Hide the button if the conditions are not met
    }

    return (
        <Button
            onClick={handleStartTrip}
            disabled={tripStarting}
            variant='link'
            size='lg'
            className='flex items-center gap-2 text-green-500 hover:text-green-600 p-0 font-semibold'>
            {tripStarting ? (
                <div className='loader' />
            ) : (
                <>
                    <Check className='size-4 text-green-500' /> Start Trip
                </>
            )}
        </Button>
    );
}
