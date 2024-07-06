'use client';

import { toast } from '@/components/ui/use-toast';
import { toTitleCase } from '@/lib/utils';
import { deleteImageVideoUploaded } from '@/server/tripOperations';
import { format } from 'date-fns';
import { FiTrash2 } from 'react-icons/fi';

const TripImageVideoCarousel = ({ images, uploadedBy }) => {
    const deleteImage = async (id: any) => {
        try {
            const response: any = await deleteImageVideoUploaded(id);

            if (response.success) {
                toast({
                    duration: 3000,
                    variant: 'success',
                    description: 'Image/Video Deleted successfully!.',
                });
                window.location.reload();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Something went wrong deleting the image/video!.',
                });
            }
        } catch (error) {
            toast({
                duration: 3000,
                variant: 'destructive',
                description: 'Something went wrong deleting the image/video!.',
            });
            console.log(error);
        }
    };
    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3  lg:grid-cols-3'>
            {images.map((item) => (
                <div className='custom-shadow h-fit  rounded-lg bg-white hover:shadow-md ' key={item.id}>
                    <div className='relative flex items-end overflow-hidden rounded-t-lg '>
                        <div className='aspect-video w-full overflow-hidden rounded-t-md bg-neutral-200 lg:aspect-video lg:h-44'>
                            {item.url.includes('.mp4') ? (
                                <video className='h-full w-full object-cover object-center transition-all ease-in-out lg:h-full lg:w-full' controls>
                                    <source src={item.url} type='video/mp4' />
                                    <track kind='captions' src='path/to/captions.vtt' srcLang='en' label='English captions' default />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.url}
                                    className='h-full w-full object-cover object-center transition-all ease-in-out lg:h-full lg:w-full'
                                />
                            )}
                        </div>
                    </div>

                    <div className=' flex h-fit flex-wrap items-center justify-between p-3'>
                        <div className=' flex flex-col flex-wrap'>
                            {item?.caption && <p className=' text-sm text-neutral-700'>{toTitleCase(item.caption)}</p>}
                            <span className='text-[11px] text-neutral-500'>Uploaded on {format(new Date(item.createdDate), 'PP, p')} </span>
                        </div>
                        {uploadedBy === 'driver' && (
                            <div>
                                <FiTrash2 className='cursor-pointer text-lg text-red-500' onClick={() => deleteImage(item.id)} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TripImageVideoCarousel;
