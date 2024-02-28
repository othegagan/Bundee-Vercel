'use client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { useRef, useState } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import { FiPaperclip } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import { LuLoader2 } from 'react-icons/lu';
import { MdDeleteForever } from 'react-icons/md';

const TripImagesComponent = ({ tripsData }: any) => {
    // tripid , userid , hostid
    const wrapperRef = useRef(null);
    const [fileList, setFileList] = useState([]);
    const [captions, setCaptions] = useState([]);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [noOfFiles, setNoOfFiles] = useState(0);
    const [uploading, setUploading] = useState(false);

    const onDragEnter = () => wrapperRef.current.classList.add('opacity-50');
    const onDragLeave = () => wrapperRef.current.classList.remove('opacity-50');
    const onDrop = () => wrapperRef.current.classList.remove('opacity-50');

    const onFileDrop = e => {
        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();

        let newFiles = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (newFiles.length > 0) {
            const allowedFiles = [];
            const exceededSizeFiles = [];
            const existingFileNames = fileList.map(file => file.name.toLowerCase()); // Array to keep track of existing file names
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
            console.log(allowedFiles.length + fileList.length + Number(tripsData?.driverTripStartingBlobs.length || 0));

            if (allowedFiles.length + fileList.length + Number(tripsData?.driverTripStartingBlobs.length || 0) > 10) {
                toast({
                    duration: 4000,
                    className: 'bg-red-500 text-white border-0',
                    title: 'Max file limit reached!.',
                    description: 'You can upload a maximum of 10 files.',
                });
                return;
            }

            if (exceededSizeFiles.length > 0) {
                toast({
                    duration: 4000,
                    className: 'bg-red-500 text-white border-0',
                    title: 'Max size limit reached!.',
                    description: "Some files exceed the maximum size limit (2MB) and won't be uploaded.",
                });
                return;
            }

            // Update the fileList state and captions if necessary
            setFileList(prevFileList => [...prevFileList, ...allowedFiles]);
            const newCaptions = Array(allowedFiles.length).fill('');
            setCaptions(prevCaptions => [...prevCaptions, ...newCaptions]);
        }
    };

    const fileRemove = file => {
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
        const uploadRequests = fileList.map((file, index) => {
            const token = localStorage.getItem('auth_token_login');
            const url = process.env.NEXT_PUBLIC_UPLOAD_IMAGE_VIDEO_URL;

            const formData = new FormData();
            const jsonData = {
                tripId: tripsData.tripid,
                isUploadedByHost: false,
                isUploadedAtStarting: true,
                url: '',
                storageRef: '',
                caption: captions[index],
                userId: tripsData.userid,
                video: file.type.includes('video'),
            };
            formData.append('json', JSON.stringify(jsonData));
            formData.append('hostid', tripsData.hostid);
            formData.append('image', file);

            return axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Add the desired headers here
                    bundee_auth_token: token,
                },
                onUploadProgress: progressEvent => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setUploadProgress(prevProgress => {
                        const updatedProgress = [...prevProgress];
                        updatedProgress[index] = progress;
                        return updatedProgress;
                    });
                },
            });
        });

        try {
            await Promise.all(uploadRequests);
            // alert('All files uploaded successfully!');
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
            <div>
                <Button
                    variant='ghost'
                    className='relative flex items-center gap-2 text-neutral-500 hover:text-neutral-600'
                    onClick={() => {
                        handleOpenModal();
                    }}>
                    <FiPaperclip className='w-6 h-6' />
                    {noOfFiles > 0 ? (
                        <div className='absolute inline-flex items-center justify-center w-6 h-6  font-medium text-xs text-white bg-primary rounded-full -top-1 -right-1'>
                            {noOfFiles}
                        </div>
                    ) : null}
                </Button>
            </div>

            {showModal && (
                <div className='fixed inset-0 z-40 flex items-end bg-black bg-opacity-20 sm:items-center sm:justify-center appear-done enter-done backdrop-blur-[4px]'>
                    <div
                        className='fixed inset-0 -z-10'
                        onClick={() => {
                            handleCloseModal();
                        }}></div>
                    <div className='w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg sm:rounded-lg sm:m-4 md:max-w-6xl md:p-7'>
                        <div>
                            <header className='flex justify-between gap-2 select-none'>
                                <div className='flex flex-col gap-2'>
                                    <p className='font-semibold text-lg'>Upload vehicle Images</p>
                                </div>

                                <Button
                                    variant='ghost'
                                    type='button'
                                    onClick={() => {
                                        handleCloseModal();
                                    }}>
                                    <IoClose className='w-6 h-6 text-neutral-500 cursor-pointer' />
                                </Button>
                            </header>
                            <p className='font-normal text-sm text-neutral-500'>
                                Note: This images uploaded for the purposes of recording vehicle condition in the event of damage.
                            </p>
                            {error && <p className='text-red-400'>{error}</p>}

                            <div className='grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-10 mt-5 sm:mt-8'>
                                <div className='grid-cols-1 md:col-span-2'>
                                    <div
                                        ref={wrapperRef}
                                        className='relative border-2 border-dashed border-purple-500 bg-purple-100 rounded-lg p-8 w-full h-full flex flex-col justify-center items-center text-center cursor-pointer transition ease-in-out duration-150 hover:border-neutral-500 hover:bg-neutral-100'
                                        onDragEnter={onDragEnter}
                                        onDragLeave={onDragLeave}
                                        onDrop={onDrop}>
                                        <div className='flex flex-col gap-2 items-center justify-center text-neutral-600 hover:text-neutral-400'>
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
                                            className='opacity-0 absolute inset-0 w-full h-full cursor-pointer'
                                        />
                                    </div>
                                </div>

                                <div className='md:col-span-3'>
                                    {fileList.length > 0 ? (
                                        <div className='flex flex-col justify-between items-stretch gap-4 h-full'>
                                            <div className='grid grid-col-1 lg:grid-cols-2 gap-4 w-full   lg:h-64 rounded-md border p-2 overflow-y-auto'>
                                                {fileList.map((item, index) => (
                                                    <div key={index} className='flex lg:flex-col gap-3 w-full'>
                                                        <div className='overflow-hidden relative'>
                                                            {item.type.startsWith('image/') ? (
                                                                <img
                                                                    className='h-full w-32 lg:w-[90%] rounded-md border-1 border-neutral-400'
                                                                    src={URL.createObjectURL(item)}
                                                                    alt={item.name}
                                                                />
                                                            ) : (
                                                                <video
                                                                    className='h-full w-32 lg:w-[90%] rounded-md border-1 border-neutral-400'
                                                                    controls
                                                                    muted
                                                                    src={URL.createObjectURL(item)}>
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            )}
                                                        </div>
                                                        <div className='flex gap-3 w-full justify-between items-start'>
                                                            <div className='flex flex-col gap-2 w-full'>
                                                                <input
                                                                    className='flex h-8 w-full  rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50  pr-4 font-normal text-foreground placeholder:text-muted-foreground/80'
                                                                    placeholder='Enter caption'
                                                                    aria-haspopup='listbox'
                                                                    type='text'
                                                                    value={captions[index]}
                                                                    onChange={e => handleCaptionChange(index, e.target.value)}
                                                                />
                                                                <div className='flex gap-3 text-neutral-500'>
                                                                    <p className='text-xs '>
                                                                        <span className='truncate'>{item.name}</span>
                                                                        <span className='text-xs ml-2'>({(item.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                                                    </p>
                                                                </div>
                                                                {uploadProgress[index] !== undefined && (
                                                                    <div className='flex gap-3 items-center'>
                                                                        <div className='w-[90%] bg-neutral-200 rounded-full h-2 dark:bg-neutral-700'>
                                                                            <div
                                                                                className='bg-purple-600 h-2 rounded-full'
                                                                                style={{ width: `${uploadProgress[index]}%` }}
                                                                                aria-valuenow={uploadProgress[index]}
                                                                                aria-valuemin={0}
                                                                                aria-valuemax={100}></div>
                                                                        </div>
                                                                        <span className='text-xs whitespace-nowrap'>{uploadProgress[index]}%</span>
                                                                    </div>
                                                                )}

                                                                {/* <CircleProgressBar
                                                                initialValue={
                                                                    uploadProgress[
                                                                        index
                                                                    ]
                                                                }
                                                                color="blue-500"
                                                            /> */}
                                                            </div>

                                                            <MdDeleteForever
                                                                className='w-14  text-red-400 text-2xl cursor-pointer hover:text-red-500 transition-all ease-in-out'
                                                                onClick={() => fileRemove(item)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className='flex justify-between flex-wrap items-center'>
                                                <p className='text-sm text-neutral-500'>{fileList.length} files selected</p>
                                                <Button onClick={handleUpload} disabled={uploading} className='px-10'>
                                                    {uploading ? <LuLoader2 className='w-5 h-5 text-white animate-spin' /> : <p>Upload</p>}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex w-full h-full  justify-center items-center'>
                                            <p>Please select the images/videos you want to upload ..!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TripImagesComponent;
