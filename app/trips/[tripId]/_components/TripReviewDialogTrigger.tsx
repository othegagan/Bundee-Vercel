'use client';

import { Button } from '@/components/ui/button';
import useTripReviewDialog from '@/hooks/dialogHooks/useTripReviewDialog';

export default function TripReviewDialogTrigger({ tripData }: { tripData: any }) {
    const tripReviewDialog = useTripReviewDialog();
    return (
        <Button
            className='mt-4  w-full  '
            onClick={() => {
                tripReviewDialog.onOpen();
                tripReviewDialog.setTripData(tripData);
            }}>
            Add a review
        </Button>
    );
}
