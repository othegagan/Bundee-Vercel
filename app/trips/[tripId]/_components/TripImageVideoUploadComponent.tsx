'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import FileUploader from '@/components/ui/extension/file-uploader';
import { getSession } from '@/lib/auth';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

interface TripImageVideoUploadComponentProps {
    tripid: number;
    userId: string | number;
    hostId: string | number | any;
    driverTripStartingBlobs: any[] | [];
}

export default function TripImageVideoUploadComponent({ tripid, userId, hostId, driverTripStartingBlobs }: TripImageVideoUploadComponentProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [files, setFiles] = useState<File[] | null>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const openDialog = () => {
        setFiles([]); // reset the files array when dialog opens
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
    };

    const handleFileSelect = (selectedFiles: File[]) => {
        setFiles((prevFiles) => {
            const fileNames = prevFiles.map((file) => file.name.toLowerCase());
            const newFiles = selectedFiles.filter(
                (file) => !fileNames.includes(file.name.toLowerCase()) // Prevent duplicates
            );
            return [...prevFiles, ...newFiles];
        });
    };

    const uploadFiles = async () => {
        if (!files || files.length === 0) return;

        setIsUploading(true);

        const session = await getSession();

        try {
            // Loop over files sequentially instead of running them all concurrently
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                const url = process.env.NEXT_PUBLIC_UPLOAD_IMAGE_VIDEO_URL;

                const formData = new FormData();
                const jsonData = {
                    tripId: tripid,
                    isUploadedByHost: false,
                    isUploadedAtStarting: true,
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
                        bundee_auth_token: session.authToken
                    }
                });
            }

            toast.success('All files uploaded successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error uploading files', error);
            setIsUploading(false);
            setError('Error uploading files. Please try again later.');
        }
    };

    return (
        <>
            <Button variant='link' className='text-md font-normal underline underline-offset-2 px-0 text-foreground' onClick={openDialog}>
                Upload media
            </Button>

            <Dialog
                isOpen={showDialog}
                openDialog={openDialog}
                closeDialog={closeDialog}
                title='Upload vehicle Images'
                description='Images are uploaded for the purposes of recording vehicle condition in the event of damage.'
                className='w-full md:max-w-3xl lg:max-w-4xl'>
                <DialogBody>
                    <FileUploader onFileSelect={handleFileSelect} setError={setError} />
                </DialogBody>
                <DialogFooter className='flex md:justify-between flex-col md:flex-row'>
                    {error && <div className='text-red-400'>{error}</div>}

                    <Button
                        onClick={uploadFiles}
                        className='bg-black text-white hover:bg-black/90 ml-auto'
                        disabled={isUploading || files.length === 0}
                        loading={isUploading}
                        loadingText='Uploading...'>
                        {`Upload ${files.length > 1 ? `${files.length} Files` : 'File'}`}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
