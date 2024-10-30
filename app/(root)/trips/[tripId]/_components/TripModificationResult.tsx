import { Button } from '@/components/ui/button';
import { DialogBody } from '@/components/ui/dialog';
import { AlertCircleIcon, CheckCircle, XCircle } from 'lucide-react';

interface TripModificationResultProps {
    success: boolean;
    message: string | null;
    onClose: () => void;
}

export default function TripModificationResult({ success, onClose, message }: TripModificationResultProps) {
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

                {message && !success && (
                    <div className='my-3 flex select-none items-start gap-4 rounded-md bg-red-50 p-3'>
                        <AlertCircleIcon className='h-5 w-5 text-red-400' />
                        <p className='font-medium text-red-600 text-sm'>{message}</p>
                    </div>
                )}
                <Button className='mt-2' type='button' onClick={handleClose} variant='outline'>
                    Return To Trip
                </Button>
            </div>
        </DialogBody>
    );
}
