'use client';
import { deleteImageVideoUploaded } from '@/app/_actions/deleteImageVideoUploaded';
import { toTitleCase } from '@/lib/utils';
import { format } from 'date-fns';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from '../ui/use-toast';

const TripImageVideoCarousel = ({ images, uploadedBy }) => {
    const deleteImage = async (id: any) => {
        const token = localStorage.getItem('bundee_auth_token');

        try {
            const response: any = await deleteImageVideoUploaded(id, token);

            if (response.success) {
                toast({
                    duration: 3000,
                    className: 'bg-green-500 text-white border-0',
                    title: 'Image/Video Deleted successfully!.',
                    description: '',
                });
                window.location.reload();
            } else {
                toast({
                    duration: 3000,
                    className: 'bg-red-500 text-white border-0',
                    title: 'Something went wrong deleting the image/video!.',
                    description: '',
                });
            }
        } catch (error) {
            toast({
                duration: 3000,
                className: 'bg-red-500 text-white border-0',
                title: 'Something went wrong deleting the image/video!.',
                description: '',
            });
            console.log(error);
        }
    };
    return (
        <>
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3  gap-4'>
                {images.map(item => (
                    <div className='custom-shadow h-fit  rounded-lg bg-white hover:shadow-md ' key={item.id}>
                        <div className='relative flex items-end overflow-hidden rounded-t-lg '>
                            <div className='aspect-video w-full overflow-hidden rounded-t-md bg-neutral-200  lg:aspect-video lg:h-44'>
                                {item.url.includes('.mp4') ? (
                                    <video className='h-full w-full  object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full' controls>
                                        <source src={item.url} type='video/mp4' />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <img src={item.url} alt={item.url} className='h-full w-full object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full' />
                                )}
                            </div>
                        </div>

                        <div className=' p-3 h-fit flex flex-wrap justify-between items-center'>
                            <div className=' flex flex-wrap flex-col'>
                                <p></p>
                                {item?.caption && <p className=' text-sm text-neutral-700'>{toTitleCase(item.caption)}</p>}
                                <span className='text-[11px] text-neutral-500'>Uploaded on {format(new Date(item.createdDate), 'PP, p')} </span>
                            </div>
                            {uploadedBy == 'driver' && (
                                <div>
                                    <FiTrash2 className='text-red-500 text-lg cursor-pointer' onClick={() => deleteImage(item.id)} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default TripImageVideoCarousel;
