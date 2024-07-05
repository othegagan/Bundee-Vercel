'use client';

import { useState } from 'react';
import Rating from '@/components/ui/rating';
import useTripReviewModal from '@/hooks/useTripReviewModal';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { addTripReview } from '@/server/tripOperations';
import { toast } from '../ui/use-toast';
import { Dialog, DialogBody } from '../ui/dialog';

const TripReviewModal = () => {
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState('');
    const tripReviewModal = useTripReviewModal();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const hostId = tripReviewModal.tripData.hostid;
            const tripId = tripReviewModal.tripData.tripid;
            const vehicleId = tripReviewModal.tripData.vehicleId;
            const response = await addTripReview(hostId, tripId, rating, comments, vehicleId);

            if (response.success) {
                toast({
                    duration: 4000,
                    variant: 'success',
                    description: 'Trip Review Added successfully',
                });
                closeModal();
                window.location.reload();
            } else {
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    description: 'Something went wrong. Try again..!',
                });
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    function openModal() {
        setRating(0);
        setComments('');
        tripReviewModal.onOpen();
    }
    function closeModal() {
        setRating(0);
        setComments('');
        tripReviewModal.onClose();
    }

    return (
        <Dialog isOpen={tripReviewModal.isOpen} closeDialog={closeModal} openDialog={openModal} className='lg:max-w-lg' title='Trip Review'>
            <DialogBody>
                <main className='flex flex-col  p-2 md:p-6 md:pb-0 '>
                    <Rating rating={rating} setRating={setRating} />
                    <div className='my-4 flex flex-col gap-2'>
                        <Label> Comments</Label>
                        <Textarea
                            placeholder='Leave your comments here...'
                            value={comments}
                            onChange={e => {
                                setComments(e.target.value);
                            }}
                        />
                    </div>
                    <Button
                        className='ml-auto'
                        variant='black'
                        loading={loading}
                        loadingText='Submitting...'
                        disabled={rating === 0 && loading}
                        onClick={handleSubmit}>
                        Submit
                    </Button>
                </main>
            </DialogBody>
        </Dialog>
    );
};

export default TripReviewModal;
