'use client';

import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

const schema = z.object({
    frontImageBase64: z.string().min(1, 'Front scan is required'),
    backOrSecondImageBase64: z.string().min(1, 'Document PDF417 barcode is required'),
    faceImageBase64: z.string().min(1, 'Selfie is required')
});

type FormFields = z.infer<typeof schema>;

export default function DrivingLicenceDialog() {
    const { isOpen, isUpdate, onOpen, onClose } = useDrivingLicenceDialog();
    const [uploadedFiles, setUploadedFiles] = useState({
        front: false,
        backOrSecond: false,
        face: false
    });

    const {
        register,
        handleSubmit,
        setError,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onSubmit'
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormFields) => {
        try {
            setError(field, { message: null });

            const file = e.target.files?.[0];
            if (file) {
                if (file.size > MAX_FILE_SIZE) {
                    setError(field, { message: 'File size should not exceed 3 MB' });
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    setValue(field, base64String);
                    setUploadedFiles((prev) => ({ ...prev, [field.replace('ImageBase64', '')]: true }));
                };
                reader.readAsDataURL(file);
            }
        } catch (error: any) {
            setError('root', { type: 'manual', message: error.message });
            console.log(error);
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                frontImageBase64: data.frontImageBase64,
                backOrSecondImageBase64: data.backOrSecondImageBase64,
                faceImageBase64: data.faceImageBase64,
                documentType: 1,
                trackString: ''
            };

            console.log('payload', payload);
            // Process the form data here
        } catch (error: any) {
            console.log(error);
        }
    };

    function closeModal() {
        reset();
        setUploadedFiles({ front: false, backOrSecond: false, face: false });
        onClose();
    }

    return (
        <Dialog
            title={isUpdate ? 'Update Driving Licence' : 'Add Driving Licence'}
            description='Max file size is 3 MB'
            isOpen={isOpen}
            openDialog={() => onOpen()}
            closeDialog={() => closeModal()}
            onInteractOutside={false}
            className='lg:max-w-sm'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='flex flex-col gap-y-4'>
                    <div className='space-y-2'>
                        <label htmlFor='frontImage' className='  flex gap-4 items-center  w-full h-full  border  rounded-md px-2  cursor-pointer'>
                            <input
                                type='file'
                                id='frontImage'
                                accept='image/*'
                                onChange={(e) => handleFileUpload(e, 'frontImageBase64')}
                                className='hidden w-full h-full'
                            />
                            <Image src='/icons/driving-licence-front.svg' className='w-12 h-12' alt='Front' width={48} height={48} />
                            <p>Front Scan</p>
                            {uploadedFiles.front && <CircleCheck className='size-5 ml-auto text-green-500' />}
                        </label>
                        <FormError message={errors.frontImageBase64?.message} />
                    </div>

                    <div className='space-y-2'>
                        <label htmlFor='backImage' className='  flex gap-4 items-center  w-full h-full  border  rounded-md px-2  cursor-pointer'>
                            <input
                                type='file'
                                id='backImage'
                                accept='image/*'
                                onChange={(e) => handleFileUpload(e, 'backOrSecondImageBase64')}
                                className='hidden w-full h-full'
                            />
                            <Image src='/icons/driving-licence-back.svg' className='w-12 h-12' alt='back' width={48} height={48} />
                            <p>Document PDF417 Barcode</p>
                            {uploadedFiles.backOrSecond && <CircleCheck className='size-5 ml-auto text-green-500' />}
                        </label>
                        <FormError message={errors.backOrSecondImageBase64?.message} />
                    </div>

                    <div className='space-y-2'>
                        <label htmlFor='selfieImage' className='  flex gap-4 items-center  w-full h-full  border  rounded-md px-2  cursor-pointer'>
                            <input
                                type='file'
                                id='selfieImage'
                                accept='image/*'
                                onChange={(e) => handleFileUpload(e, 'faceImageBase64')}
                                className='hidden w-full h-full'
                            />
                            <Image src='/icons/selfie.svg' className='w-12 h-12' alt='Selfie' width={48} height={48} />
                            <p>Selfie</p>
                            {uploadedFiles.face && <CircleCheck className='size-5 ml-auto text-green-500' />}
                        </label>
                        <FormError message={errors.faceImageBase64?.message} />
                    </div>

                    <FormError message={errors.root?.message} />

                    <Button type='submit' variant='black' className='mt-3 w-full' disabled={isSubmitting} loading={isSubmitting} loadingText='Submitting...'>
                        Submit
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

const FormError = ({ message }) => {
    if (!message) {
        return null;
    }
    return <p className='text-xs font-medium text-red-400'>{message}</p>;
};
