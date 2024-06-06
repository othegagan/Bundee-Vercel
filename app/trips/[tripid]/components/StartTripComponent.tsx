import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { startTripByDriver } from '@/server/userOperations';
import React, { useState } from 'react';

export default function StartTripComponent({ starttime, tripid }) {
    console.log(starttime, tripid);
    const [tripStarting, setTripStarting] = useState(false);

    const handleStartTrip = async () => {
        try {
            setTripStarting(true);
            const response = await startTripByDriver(Number(tripid));
            if (response.success) {
                window.location.reload();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Something went wrong in starting the trip',
                });
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error starting the trip', error);
        } finally {
            setTripStarting(false);
        }
    };

    const currentTime = new Date().getTime();
    const tripStartTime = new Date(starttime).getTime();
    // console.log('Current Time:', currentTime);
    // console.log('Trip Start Time:', tripStartTime);

    if (currentTime < tripStartTime - 1000 * 60 * 60) {
        return (
            <Button onClick={handleStartTrip} disabled={tripStarting} variant='green' size='lg'>
                {tripStarting ? <div className='loader'></div> : 'Start Trip'}
            </Button>
        );
    } else {
        return null; // or any other action you want to take if the condition is not met
    }
}
