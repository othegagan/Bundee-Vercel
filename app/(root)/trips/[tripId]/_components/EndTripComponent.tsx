'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { FileInput, FileUploader } from '@/components/ui/extension/file-uploader';
import { getSession } from '@/lib/auth';
import { FileUploadDropzoneIcon } from '@/public/icons';
import { endReservation } from '@/server/tripOperations';
import axios from 'axios';
import { CheckCircle, Files, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { DropzoneOptions } from 'react-dropzone';

type Step = 'initial' | 'upload' | 'uploadSuccess' | 'confirm' | 'success' | 'error';

interface EndTripComponentProps {
    tripId: number | string | any;
    userId: number | string | any;
    hostId: string | number | any;
}

export default function EndTripComponent({ tripId, userId, hostId }: EndTripComponentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('initial');

    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setStep('initial');
        setLoading(false);
        setFiles([]);
        setError('');
        setIsUploading(false);
    }

    async function endTrip() {
        try {
            setLoading(true);
            setError('');
            const response = await endReservation(tripId);

            if (response.success) {
                setStep('success');
                setTimeout(() => {
                    closeModal();
                    window.location.reload();
                }, 2000);
            } else {
                setStep('error');
                setError(response.message);
                setTimeout(() => {
                    closeModal();
                }, 2000);
            }
        } catch (error) {
            console.error('Error cancelling the trip', error);
        } finally {
            setLoading(false);
        }
    }

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
                    tripId: tripId,
                    isUploadedByHost: false,
                    isUploadedAtStarting: false,
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
            setStep('uploadSuccess');

            setTimeout(() => {
                setStep('confirm');
            }, 2000);
        } catch (error) {
            console.error('Error uploading files', error);
            setIsUploading(false);
            setError('Error uploading files. Please try again later.');
        }
    }

    const dropzone = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png']
        },
        multiple: true,
        maxFiles: 10,
        maxSize: 15 * 1024 * 1024
    } as DropzoneOptions;

    const title = step === 'upload' ? 'Upload Photos' : ['uploadSuccess', 'error', 'success'].includes(step) ? '' : 'End Trip';

    return (
        <>
            <Button
                onClick={() => {
                    openModal();
                }}
                variant='link'
                className='flex items-center gap-2 p-0 font-semibold text-red-500 hover:text-red-600'
                size='lg'>
                <X className='size-4' />
                End trip
            </Button>

            <Dialog isOpen={isModalOpen} openDialog={openModal} closeDialog={closeModal} onInteractOutside={step === 'initial'} title={title}>
                {step === 'initial' && (
                    <>
                        <DialogBody>
                            <p>Add photos of the vehicle to document its condition. (Optional)</p>
                        </DialogBody>
                        <DialogFooter className='mt-5'>
                            <Button type='button' variant='outline' onClick={() => setStep('confirm')} className='w-full sm:w-auto '>
                                Skip
                            </Button>

                            <Button type='button' className='w-full sm:w-auto ' loading={loading} onClick={() => setStep('upload')}>
                                Upload Photos
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'upload' && (
                    <>
                        <DialogBody>
                            <div className='flex flex-col gap-4 text-sm'>
                                <div className='flex w-full flex-col gap-4 overflow-hidden'>
                                    <FileUploader
                                        value={files}
                                        onValueChange={handleFileUpload}
                                        dropzoneOptions={dropzone}
                                        className='relative h-40 rounded-lg '>
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
                        <DialogFooter className='mt-5'>
                            <Button type='button' variant='outline' onClick={() => setStep('initial')} className='w-full sm:w-auto '>
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                className='w-full sm:w-auto'
                                disabled={isUploading || files.length === 0}
                                loading={isUploading}
                                loadingText='Uploading...'
                                onClick={handleSubmit}>
                                Upload
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'uploadSuccess' && (
                    <DialogBody>
                        <div className='grid grid-cols-1 place-items-center space-y-4'>
                            <CheckCircle className='h-20 w-20 text-green-500' />
                            <h3 className='text-center font-semibold text-lg'>Uploaded Photos Successfully</h3>
                        </div>
                    </DialogBody>
                )}

                {step === 'confirm' && (
                    <>
                        <DialogBody>
                            <p>Are you ready to end your trip? This action cannot be undone.</p>
                        </DialogBody>
                        <DialogFooter className='mt-5'>
                            <Button type='button' variant='outline' onClick={closeModal} className='w-full sm:w-auto '>
                                Cancel
                            </Button>

                            <Button type='button' className='w-full sm:w-auto ' loading={loading} onClick={endTrip}>
                                End Trip
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'success' && (
                    <DialogBody>
                        <div className='grid grid-cols-1 place-items-center space-y-4'>
                            <CheckCircle className='h-20 w-20 text-green-500' />
                            <h3 className='text-center font-semibold text-lg'>Trip Ended Successfully</h3>
                        </div>
                    </DialogBody>
                )}

                {step === 'error' && (
                    <DialogBody>
                        <div className='grid grid-cols-1 place-items-center space-y-4'>
                            <XCircle className='h-20 w-20 text-red-500' />
                            <h3 className='text-center font-semibold text-lg'>Trip End Failed</h3>
                            <p className='text-sm'>{error}</p>
                        </div>
                    </DialogBody>
                )}
            </Dialog>
        </>
    );
}
