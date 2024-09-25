import { Button } from '@/components/ui/button';
import { DialogBody } from '@/components/ui/dialog';
import { CheckCircle, XCircle } from 'lucide-react';

interface TripModificationResultProps {
    success: boolean;
    onClose: () => void;
}

export default function TripModificationResult({ success, onClose }: TripModificationResultProps) {
    const handleClose = () => {
        onClose();
        window.location.reload();
    };

    return (
        <DialogBody>
            <div className='grid grid-cols-1 place-items-center space-y-4'>
                {success ? <CheckCircle className='h-20 w-20 text-green-500' /> : <XCircle className='h-20 w-20 text-red-500' />}
                <h3 className='text-center font-semibold text-lg'>{success ? 'Trip modification submitted' : 'Trip modification failed'}</h3>
                {success && <p className='text-lg'>Enjoy your journey with us!</p>}
                <Button className='mt-2' type='button' onClick={handleClose} variant='outline'>
                    Return To Trip
                </Button>
            </div>
        </DialogBody>
    );
}
