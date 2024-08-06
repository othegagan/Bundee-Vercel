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
    frontImageBase64: z.string({ message: 'Front scan is required' }).min(1, 'Front scan is required'),
    backOrSecondImageBase64: z.string({ message: 'Back scan is required' }).min(1, 'Document PDF417 barcode is required'),
    faceImageBase64: z.string({ message: 'Selfie is required' }).min(1, 'Selfie is required')
});

type FormFields = z.infer<typeof schema>;

type InputFieldConfig = {
    id: string;
    label: string;
    step: number;
    field: keyof FormFields;
    icon: string;
};

const inputFieldsConfig: InputFieldConfig[] = [
    {
        id: 'frontImage',
        label: 'Front Scan',
        step: 1,
        field: 'frontImageBase64',
        icon: '/icons/driving-licence-front.svg'
    },
    {
        id: 'backImage',
        label: 'Document PDF417 Barcode',
        step: 2,
        field: 'backOrSecondImageBase64',
        icon: '/icons/driving-licence-back.svg'
    },
    {
        id: 'selfieImage',
        label: 'Selfie',
        step: 3,
        field: 'faceImageBase64',
        icon: '/icons/selfie.svg'
    }
];

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
            description='The maximum file size for each image is 3MB.'
            isOpen={isOpen}
            openDialog={() => onOpen()}
            closeDialog={() => closeModal()}
            onInteractOutside={false}
            className='lg:max-w-md'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='flex flex-col gap-y-4'>
                    {inputFieldsConfig.map(({ id, label, field, icon, step }) => (
                        <div key={id} className='space-y-2'>
                            <label
                                htmlFor={id}
                                title={`Upload ${label}`}
                                className={`flex gap-4 items-center w-full h-full border rounded-md px-2 py-3 cursor-pointer ${
                                    uploadedFiles[field.replace('ImageBase64', '')] ? 'border-green-500' : ''
                                }`}>
                                <input
                                    type='file'
                                    id={id}
                                    accept='image/png, image/jpeg, image/jpg'
                                    onChange={(e) => handleFileUpload(e, field)}
                                    className='hidden w-full h-full'
                                />
                                {uploadedFiles[field.replace('ImageBase64', '')] ? (
                                    <img
                                        src={URL.createObjectURL((document.getElementById(id) as HTMLInputElement).files[0])}
                                        className='w-20 h-12 object-cover rounded-md'
                                        alt={label}
                                    />
                                ) : (
                                    <Image src={icon} className='w-20 h-12' alt={label} width={48} height={48} />
                                )}
                                <div className='flex flex-col'>
                                    <p className='text-16 font-bold'>Step {step}</p>
                                    <p className='text-muted-foreground'>{label}</p>
                                </div>
                                {uploadedFiles[field.replace('ImageBase64', '')] && <CircleCheck className='size-6 ml-auto text-green-500' />}
                            </label>
                            <FormError message={errors[field]?.message} />
                        </div>
                    ))}

                    <FormError message={errors.root?.message} />

                    <Button type='submit' variant='black' className='mt-3 w-full' disabled={isSubmitting} loading={isSubmitting} loadingText='Submitting...'>
                        Verify
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
