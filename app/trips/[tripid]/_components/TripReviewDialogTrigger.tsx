'use client';

import useTripReviewModal from '@/hooks/useTripReviewModal';

export default function TripReviewDialogTrigger({ tripData }: { tripData: any }) {
    const tripReviewModal = useTripReviewModal();
    return (
        <div
            className='mt-4 flex w-full cursor-pointer justify-center rounded-md bg-yellow-400 px-10 py-2 text-center text-sm font-medium tracking-tight text-black hover:bg-yellow-500 active:scale-95'
            onClick={() => {
                tripReviewModal.onOpen();
                tripReviewModal.setTripData(tripData);
            }}>
            Add a review
        </div>
    );
}
