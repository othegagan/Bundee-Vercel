'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ImagePreview from '@/components/ui/image-preview';
import { deleteImageVideoUploaded } from '@/server/tripOperations';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TripMedia {
    id: number;
    tripId?: number;
    isUploadedByHost: boolean;
    isUploadedAtStarting: boolean;
    url: string;
    caption?: string;
    createdDate: string;
    name?: string;
    avatar?: string;
}

interface TripMediaDisplayProps {
    hostTripStartingBlobs?: TripMedia[];
    hostTripCompletingBlobs?: TripMedia[];
    driverTripStartingBlobs?: TripMedia[];
    driverTripCompletingBlobs?: TripMedia[];
    hostAvatar?: string;
    hostName: string;
    driverAvatar?: string;
    driverName: string;
}

export default function TripMediaDisplay({
    hostTripCompletingBlobs,
    hostTripStartingBlobs,
    driverTripStartingBlobs,
    driverTripCompletingBlobs,
    hostAvatar,
    hostName,
    driverAvatar,
    driverName
}: TripMediaDisplayProps) {
    return (
        <div className='grid grid-cols-2 gap-4 overflow-x-auto md:grid-cols-3 md:gap-6'>
            {hostTripStartingBlobs?.map((item) => (
                <MediaDisplay
                    key={item.id}
                    id={item.id}
                    createdDate={item.createdDate}
                    url={item.url}
                    isUploadedAtStarting={item.isUploadedAtStarting}
                    isUploadedByHost={item.isUploadedByHost}
                    name={hostName}
                    avatar={hostAvatar}
                />
            ))}
            {hostTripCompletingBlobs?.map((item) => (
                <MediaDisplay
                    key={item.id}
                    id={item.id}
                    createdDate={item.createdDate}
                    url={item.url}
                    isUploadedAtStarting={item.isUploadedAtStarting}
                    isUploadedByHost={item.isUploadedByHost}
                    name={hostName}
                    avatar={hostAvatar}
                />
            ))}
            {driverTripStartingBlobs?.map((item) => (
                <MediaDisplay
                    key={item.id}
                    id={item.id}
                    createdDate={item.createdDate}
                    url={item.url}
                    isUploadedAtStarting={item.isUploadedAtStarting}
                    isUploadedByHost={item.isUploadedByHost}
                    name={driverName}
                    avatar={driverAvatar}
                />
            ))}
            {driverTripCompletingBlobs?.map((item) => (
                <MediaDisplay
                    key={item.id}
                    id={item.id}
                    createdDate={item.createdDate}
                    url={item.url}
                    isUploadedAtStarting={item.isUploadedAtStarting}
                    isUploadedByHost={item.isUploadedByHost}
                    name={driverName}
                    avatar={driverAvatar}
                />
            ))}
        </div>
    );
}

function MediaDisplay({ id, createdDate, url, isUploadedAtStarting, isUploadedByHost, name, avatar }: TripMedia) {
    async function deleteImage(id: any) {
        try {
            const response: any = await deleteImageVideoUploaded(id);

            if (response.success) {
                toast.success('Image/Video Deleted successfully!.');
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                toast.error('Something went wrong deleting the image/video!.');
            }
        } catch (error) {
            toast.error('Something went wrong deleting the image/video!.');
            console.error(error);
        }
    }
    return (
        <div className='relative flex flex-col overflow-hidden rounded-md border'>
            <div className='relative h-36'>
                {url.includes('.mp4') ? (
                    <video className='h-full w-full object-cover object-center lg:h-full lg:w-full' controls>
                        <source src={url} type='video/mp4' />
                        <track kind='captions' src='path/to/captions.vtt' srcLang='en' label='English captions' default />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <ImagePreview url={url} alt='Media file' className='h-full w-full rounded-b-none border-0 object-cover object-center ' />
                )}
                <div className='absolute top-0 right-0 rounded-bl bg-white px-2 font-medium text-black text-sm'>{isUploadedAtStarting ? 'Start' : 'End'}</div>

                {!isUploadedByHost && (
                    <Button
                        type='button'
                        variant='secondary'
                        size='icon'
                        onClick={() => deleteImage(id)}
                        className='absolute right-2 bottom-2 rounded-full p-2 '>
                        <Trash2 className='h-5 w-5 ' />
                    </Button>
                )}
            </div>
            <div className='flex flex-col gap-2 px-2 py-3'>
                <div className='flex items-center gap-2'>
                    <Avatar className='size-8'>
                        <AvatarImage src={avatar || '/dummy_avatar.png'} className='size-8 rounded-full' />
                        <AvatarFallback className='uppercase'>{name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className='line-clamp-1 font-medium text-[14px] capitalize'>{name}</div>
                        <div className='hidden text-muted-foreground text-xs md:block'> {format(new Date(createdDate), 'PP, p')}</div>
                    </div>
                </div>
                <div className='ml-2 text-muted-foreground text-xs md:hidden'> {format(new Date(createdDate), 'PP, p')}</div>
            </div>
        </div>
    );
}
