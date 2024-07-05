import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { startTripByDriver } from '@/server/userOperations';
import React, { useState, useEffect } from 'react';

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

    if (!showButton) {
        return null;
    }

    return (
        <Button onClick={handleStartTrip} disabled={tripStarting} variant='green' size='lg'>
            {tripStarting ? <div className='loader' /> : 'Start trip'}
        </Button>
    );
}
