'use client';

import { Button } from '@/components/ui/button';
import useTripReviewDialog from '@/hooks/dialogHooks/useTripReviewDialog';

export default function TripReviewDialogTrigger({ tripData }: { tripData: any }) {
    const tripReviewDialog = useTripReviewDialog();
    return (
        <Button
            variant='secondary'
            className='  w-fit ml-auto  px-10'
            onClick={() => {
                tripReviewDialog.onOpen();
                tripReviewDialog.setTripData(tripData);
            }}>
            Add a review
        </Button>
    );
}
