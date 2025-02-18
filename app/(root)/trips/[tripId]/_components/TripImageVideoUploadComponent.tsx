'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { FileInput, FileUploader } from '@/components/ui/extension/file-uploader';
import { getSession } from '@/lib/auth';
import { FileUploadDropzoneIcon } from '@/public/icons';
import axios from 'axios';
import { Files } from 'lucide-react';
import { useState } from 'react';
import type { DropzoneOptions } from 'react-dropzone';
import { toast } from 'sonner';

interface TripImageVideoUploadComponentProps {
    tripid: number;
    userId: number;
    hostId: string | number | any;
    belongsTo: 'starting' | 'ending';
}

export default function TripImageVideoUploadComponent({ tripid, userId, hostId, belongsTo }: TripImageVideoUploadComponentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    function handleFileUpload(selectedFiles: File[] | null) {
        if (!selectedFiles) return;
        setFiles((prevFiles) => {
            const fileNames = prevFiles.map((file) => file.name.toLowerCase());
            const newFiles = selectedFiles.filter(
                (file) => !fileNames.includes(file.name.toLowerCase()) // Prevent duplicates
            );
            return [...prevFiles, ...newFiles];
        });
    }

    async function handleSubmit() {
        if (files.length === 0) return;

        setIsUploading(true);

        const session = await getSession();

        try {
            // Loop over files sequentially instead of running them all concurrently
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                const url = `${process.env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL}/v1/booking/uploadMediaFiles`;

                const formData = new FormData();
                const jsonData = {
                    tripId: tripid,
                    isUploadedByHost: false,
                    isUploadedAtStarting: belongsTo === 'starting',
                    url: '',
                    storageRef: '',
                    caption: '',
                    userId: userId,
                    video: file.type.includes('video')
                };
                formData.append('json', JSON.stringify(jsonData));
                formData.append('hostid', hostId);
                formData.append('image', file);

                // Perform upload for each file
                await axios.post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        bundee_auth_token: session?.authToken
                    }
                });
            }

            toast.success('File(s) uploaded successfully!');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error('Error uploading files', error);
            setIsUploading(false);
            setError('Error uploading files. Please try again later.');
        }
    }

    function openDialog() {
        setIsOpen(true);
    }

    function closeDialog() {
        setIsOpen(false);
        setFiles([]);
        setError('');
        setIsUploading(false);
    }

    const dropzone = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png']
        },
        multiple: true,
        maxFiles: 10,
        maxSize: 15 * 1024 * 1024
    } as DropzoneOptions;

    return (
        <>
            <Button variant='link' className='px-0 font-normal text-foreground text-md underline underline-offset-2' onClick={openDialog}>
                Upload media
            </Button>

            <Dialog
                isOpen={isOpen}
                openDialog={openDialog}
                closeDialog={closeDialog}
                title='Upload vehicle Images'
                description='Images are uploaded for the purposes of recording vehicle condition in the event of damage.'
                className='w-full md:max-w-3xl lg:max-w-4xl'>
                <DialogBody>
                    <div className='flex flex-col gap-4 text-sm'>
                        <div className='flex w-full flex-col gap-4 overflow-hidden'>
                            <FileUploader value={files} onValueChange={handleFileUpload} dropzoneOptions={dropzone} className='relative h-40 rounded-lg '>
                                <FileInput className='flex h-full flex-col items-center justify-center bg-muted'>
                                    <FileUploadDropzoneIcon />
                                    <p className='mb-1 text-muted-foreground text-sm'>
                                        <span className='font-semibold'>Click to upload vehicle photos</span>
                                        &nbsp; or drag and drop
                                    </p>
                                    <p className='text-muted-foreground text-xs'>SVG, PNG, JPG or GIF</p>
                                </FileInput>
                            </FileUploader>

                            {error && <div className='mt-4 text-red-500 text-sm'>{error}</div>}
                        </div>

                        {files.length > 0 && (
                            <div className='flex items-center gap-4 text-base'>
                                <Files />
                                {files.length} file{files.length !== 1 ? 's' : ''} selected
                            </div>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter className='flex flex-col md:flex-row md:justify-between'>
                    {error && <div className='text-red-400'>{error}</div>}

                    <Button
                        onClick={handleSubmit}
                        className='ml-auto bg-black text-white hover:bg-black/90'
                        disabled={isUploading || files.length === 0}
                        loading={isUploading}
                        loadingText='Uploading...'>
                        Upload
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
