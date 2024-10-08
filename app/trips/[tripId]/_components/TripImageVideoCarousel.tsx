'use client';

import { toTitleCase } from '@/lib/utils';
import { deleteImageVideoUploaded } from '@/server/tripOperations';
import { format } from 'date-fns';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';

const TripImageVideoCarousel = ({ images, uploadedBy }) => {
    const deleteImage = async (id: any) => {
        try {
            const response: any = await deleteImageVideoUploaded(id);

            if (response.success) {
                toast.success('Image/Video Deleted successfully!.');
                window.location.reload();
            } else {
                toast.error('Something went wrong deleting the image/video!.');
            }
        } catch (error) {
            toast.error('Something went wrong deleting the image/video!.');
            console.log(error);
        }
    };
    return (
        <div className='grid grid-cols-2 gap-4 overflow-x-auto md:grid-cols-3'>
            {images.map((item) => (
                <div className='custom-shadow h-fit rounded-lg hover:shadow-md ' key={item.id}>
                    <div className=' relative h-32 w-full overflow-hidden rounded-t-md'>
                        {uploadedBy === 'driver' && (
                            <div className='absolute top-2 right-2 cursor-pointer rounded-md bg-background p-1'>
                                <FiTrash2 className=' text-lg text-red-500' onClick={() => deleteImage(item.id)} />
                            </div>
                        )}

                        {item.url.includes('.mp4') ? (
                            <video className='h-full w-full object-cover object-center lg:h-full lg:w-full' controls>
                                <source src={item.url} type='video/mp4' />
                                <track kind='captions' src='path/to/captions.vtt' srcLang='en' label='English captions' default />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <img src={item.url} alt={item.url} className='h-full w-full object-cover object-center ' />
                        )}
                    </div>

                    <div className=' flex h-fit flex-wrap items-center justify-between p-3'>
                        <div className=' flex flex-col flex-wrap'>
                            {item?.caption && <p className=' text-neutral-700 text-sm'>{toTitleCase(item.caption)}</p>}
                            <span className='text-[11px] text-neutral-500'>Uploaded on {format(new Date(item.createdDate), 'PP, p')} </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TripImageVideoCarousel;
