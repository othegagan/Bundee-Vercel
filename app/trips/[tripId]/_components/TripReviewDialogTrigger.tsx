'use client';

import { Button } from '@/components/ui/button';
import useTripReviewModal from '@/hooks/useTripReviewModal';

export default function TripReviewDialogTrigger({ tripData }: { tripData: any }) {
    const tripReviewModal = useTripReviewModal();
    return (
        <Button
            className='mt-4  w-full  '
            onClick={() => {
                tripReviewModal.onOpen();
                tripReviewModal.setTripData(tripData);
            }}>
            Add a review
        </Button>
    );
}
