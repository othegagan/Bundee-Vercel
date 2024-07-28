'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogBody } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { getSession } from '@/lib/auth';
import axios from 'axios';
import { useRef, useState } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import { FiPaperclip } from 'react-icons/fi';
import { LuLoader2 } from 'react-icons/lu';
import { MdDeleteForever } from 'react-icons/md';

interface TripImageVideoUploadComponentProps {
    tripid: number;
    userId: string | number;
    hostId: string | number | any;
    driverTripStartingBlobs: any[] | [];
}

const TripImageVideoUploadComponent = ({ tripid, userId, hostId, driverTripStartingBlobs }: TripImageVideoUploadComponentProps) => {
    const wrapperRef = useRef(null);
    const [fileList, setFileList] = useState([]);
    const [captions, setCaptions] = useState([]);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const onDragEnter = () => wrapperRef.current.classList.add('opacity-50');
    const onDragLeave = () => wrapperRef.current.classList.remove('opacity-50');
    const onDrop = () => wrapperRef.current.classList.remove('opacity-50');

    const onFileDrop = (e) => {
        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();

        const newFiles = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (newFiles.length > 0) {
            const allowedFiles = [];
            const exceededSizeFiles = [];
            const existingFileNames = fileList.map((file) => file.name.toLowerCase()); // Array to keep track of existing file names

            // Loop through newFiles using forEach
            Array.from(newFiles).forEach((file: File) => {
                const fileName = file.name.toLowerCase();
                if (file.size <= 2 * 1024 * 1024) {
                    // Max size of 2MB
                    if (existingFileNames.includes(fileName)) {
                        toast({
                            duration: 4000,
                            className: 'bg-red-500 text-white border-0',
                            title: 'Please select a different file.',
                            description: `File ${file.name} is a duplicate and won't be uploaded.`,
                        });
                    } else {
                        // Check if the file is an image or video
                        if (file.type.includes('image/') || file.type.includes('video/')) {
                            existingFileNames.push(fileName); // Add file name to array
                            allowedFiles.push(file);
                        } else {
                            toast({
                                duration: 4000,
                                className: 'bg-red-400 text-white',
                                title: 'Invalid file type.',
                                description: `File ${file.name} is not supported. Only images and videos are allowed.`,
                            });
                        }
                    }
                } else {
                    exceededSizeFiles.push(file);
                }
            });

            if (allowedFiles.length + fileList.length + Number(driverTripStartingBlobs.length || 0) > 10) {
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    title: 'Max file limit reached!.',
                    description: 'You can upload a maximum of 10 files.',
                });
                return;
            }

            if (exceededSizeFiles.length > 0) {
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    title: 'Max size limit reached!.',
                    description: "Some files exceed the maximum size limit (2MB) and won't be uploaded.",
                });
                return;
            }

            // Update the fileList state and captions if necessary
            setFileList((prevFileList) => [...prevFileList, ...allowedFiles]);
            const newCaptions = Array(allowedFiles.length).fill('');
            setCaptions((prevCaptions) => [...prevCaptions, ...newCaptions]);
        }
    };

    const fileRemove = (file) => {
        const index = fileList.indexOf(file);
        if (index !== -1) {
            const updatedList = [...fileList];
            updatedList.splice(index, 1);
            setFileList(updatedList);
            const updatedCaptions = [...captions];
            updatedCaptions.splice(index, 1);
            setCaptions(updatedCaptions);
        }
    };

    const handleCaptionChange = (index, value) => {
        const updatedCaptions = [...captions];
        updatedCaptions[index] = value;
        setCaptions(updatedCaptions);
    };

    const handleUpload = async () => {
        setUploading(true);
        const session = await getSession();
        const uploadRequests = fileList.map((file, index) => {
            const url = process.env.NEXT_PUBLIC_UPLOAD_IMAGE_VIDEO_URL;

            const formData = new FormData();
            const jsonData = {
                tripId: tripid,
                isUploadedByHost: false,
                isUploadedAtStarting: true,
                url: '',
                storageRef: '',
                caption: captions[index],
                userId: userId,
                video: file.type.includes('video'),
            };
            formData.append('json', JSON.stringify(jsonData));
            formData.append('hostid', hostId);
            formData.append('image', file);

            return axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Add the desired headers here
                    bundee_auth_token: session.authToken,
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setUploadProgress((prevProgress) => {
                        const updatedProgress = [...prevProgress];
                        updatedProgress[index] = progress;
                        return updatedProgress;
                    });
                },
            });
        });

        try {
            await Promise.all(uploadRequests);
            toast({
                duration: 3000,
                className: 'bg-green-500 text-white',
                title: 'Uploaded successfully!.',
                description: 'All files uploaded successfully!.',
            });
            setFileList([]);
            setCaptions([]);
            setUploadProgress([]);
            handleCloseModal();
            setUploading(false);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error uploading files', error);
            setUploading(false);
            setError('Error uploading files. Please try again later.');
        }
    };

    const handleOpenModal = () => {
        setFileList([]);
        const body = document.querySelector('body');
        body.style.overflow = 'hidden';
        setShowModal(true);
    };

    const handleCloseModal = () => {
        const body = document.querySelector('body');
        body.style.overflow = 'auto';
        setFileList([]);
        setShowModal(false);
    };

    return (
        <>
            <Button
                variant='link'
                className='text-md font-normal underline underline-offset-2 px-0 text-foreground'
                onClick={() => {
                    handleOpenModal();
                }}>
                Upload media
            </Button>

            <Dialog
                isOpen={showModal}
                closeDialog={handleCloseModal}
                title='Upload vehicle Images'
                description='Images are uploaded for the purposes of recording vehicle condition in the event of damage.'
                className='w-full md:max-w-3xl lg:max-w-4xl'>
                <DialogBody>
                    {error && <p className='text-red-400'>{error}</p>}

                    <div className='mt-5 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-5 md:gap-10'>
                        <div className='grid-cols-1 md:col-span-2'>
                            <div
                                ref={wrapperRef}
                                className='relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-500 bg-purple-100 p-8 text-center transition duration-150 ease-in-out hover:border-neutral-500 hover:bg-neutral-100'
                                onDragEnter={onDragEnter}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}>
                                <div className='flex flex-col items-center justify-center gap-2 text-neutral-600 hover:text-neutral-400'>
                                    <FaFileUpload className='text-5xl' />
                                    <p className='text-sm'>
                                        <span className='font-semibold'>Click to upload</span> or drag and drop
                                    </p>
                                    <p className='text-xs'>Max. File Size: 30MB</p>
                                </div>
                                <input
                                    type='file'
                                    accept='image/*, video/*'
                                    multiple
                                    onChange={onFileDrop}
                                    className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                                />
                            </div>
                        </div>

                        <div className='md:col-span-3'>
                            {fileList.length > 0 ? (
                                <div className='flex h-full flex-col items-stretch justify-between gap-4'>
                                    <div className='grid-col-1 grid w-full gap-4 overflow-y-auto   rounded-md border p-2 lg:h-64 lg:grid-cols-2'>
                                        {fileList.map((item, index) => (
                                            <div key={index} className='flex w-full gap-3 lg:flex-col'>
                                                <div className='relative overflow-hidden'>
                                                    {item.type.startsWith('image/') ? (
                                                        <img
                                                            className='border-1 h-full w-36 rounded-md border-neutral-400 lg:w-[90%]'
                                                            src={URL.createObjectURL(item)}
                                                            alt={item.name}
                                                        />
                                                    ) : (
                                                        <video
                                                            className='border-1 h-full w-32 rounded-md border-neutral-400 lg:w-[90%]'
                                                            controls
                                                            muted
                                                            src={URL.createObjectURL(item)}>
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                </div>
                                                <div className='flex w-full items-start justify-between gap-3'>
                                                    <div className='flex w-full flex-col gap-2'>
                                                        <input
                                                            className='flex h-8 w-full  rounded-md border border-input bg-transparent px-3 py-1 pr-4 text-sm font-normal text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/80 focus-visible:outline-none  focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                                                            placeholder='Enter caption'
                                                            aria-haspopup='listbox'
                                                            type='text'
                                                            value={captions[index]}
                                                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                                                        />
                                                        <div className='flex gap-3 text-neutral-500'>
                                                            <p className='text-xs '>
                                                                <span className='truncate'>{item.name}</span>
                                                                <span className='ml-2 text-xs'>({(item.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                                            </p>
                                                        </div>
                                                        {uploadProgress[index] !== undefined && (
                                                            <div className='flex items-center gap-3'>
                                                                <div className='h-2 w-[90%] rounded-full bg-neutral-200 dark:bg-neutral-700'>
                                                                    <div
                                                                        className='h-2 rounded-full bg-purple-600'
                                                                        style={{ width: `${uploadProgress[index]}%` }}
                                                                        aria-valuenow={uploadProgress[index]}
                                                                        aria-valuemin={0}
                                                                        aria-valuemax={100}
                                                                    />
                                                                </div>
                                                                <span className='whitespace-nowrap text-xs'>{uploadProgress[index]}%</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <MdDeleteForever
                                                        className='w-14  cursor-pointer text-2xl text-red-400 transition-all ease-in-out hover:text-red-500'
                                                        onClick={() => fileRemove(item)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='flex flex-wrap items-center justify-between'>
                                        <p className='text-sm text-neutral-500'>{fileList.length} files selected</p>
                                        <Button onClick={handleUpload} disabled={uploading} className='px-10'>
                                            {uploading ? <LuLoader2 className='h-5 w-5 animate-spin text-white' /> : <>Upload</>}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className='flex h-full w-full  items-center justify-center'>
                                    <p>Please select the images/videos you want to upload ..!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogBody>
            </Dialog>
        </>
    );
};

export default TripImageVideoUploadComponent;
