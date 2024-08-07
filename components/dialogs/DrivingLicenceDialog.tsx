'use client';

import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import { verifyDrivingProfile } from '@/hooks/useDrivingProfile';
import { IDScanErrorResponse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { CircleCheck } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { toast } from '../ui/use-toast';

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

            const response = await verifyDrivingProfile(payload);

            if (response.success) {
                toast({
                    title: 'Driving Licence Added',
                    description: 'Your driving licence has been added to your profile.',
                    variant: 'success'
                });
                closeModal();
                window.location.reload();
            } else {
                toast({
                    title: 'Error Adding Driving Licence',
                    description: 'An error occurred while adding your driving licence to your profile.',
                    variant: 'destructive'
                });
            }
        } catch (error: any) {
            try {
                const errorData = JSON.parse(error.message);
                handleError(errorData);
            } catch (parseError) {
                console.error('Error parsing error message:', parseError);
                console.error('Original error:', error);
            }
        }
    };

    function handleError(errorData: IDScanErrorResponse) {
        console.error('Error:', errorData.code, errorData.message);

        switch (errorData.code) {
            case 'ValidationError':
                setError('root', { type: 'manual', message: 'Please check all fields and try again.' });
                break;
            case 'MultipleErrors': {
                const errorMessages = errorData.multipleErrors?.map((error) => error.message).join(' ');
                setError('root', { type: 'manual', message: errorMessages || 'Multiple errors occurred. Please try again.' });
                break;
            }
            case 'OCRError':
                setError('root', { type: 'manual', message: 'Unable to read the front of the document. Please upload a clearer image.' });
                break;
            case 'MRZOCRError':
                setError('root', { type: 'manual', message: 'Unable to read the MRZ (Machine Readable Zone). Please upload a clearer image.' });
                break;
            case 'MrzIsNotPresentError':
                setError('root', { type: 'manual', message: 'The MRZ (Machine Readable Zone) is missing. Please upload a valid document.' });
                break;
            case 'FrontImageRequiredError':
                setError('root', { type: 'manual', message: 'Please upload the front image of your document.' });
                break;
            case 'BackImageOrTrackStringNotPresentError':
                setError('root', { type: 'manual', message: 'Please upload the back image of your document or provide the track string.' });
                break;
            case 'PDF417Error':
                setError('root', { type: 'manual', message: 'Unable to read the barcode. Please upload a clearer image of the back of your document.' });
                break;
            case 'FaceDocNotDetectError':
                setError('root', { type: 'manual', message: 'No face detected on the document. Please upload a valid document with a clear face photo.' });
                break;
            case 'FacePhotoNotDetectError':
                setError('root', { type: 'manual', message: 'No face detected in the selfie. Please upload a clear selfie photo.' });
                break;
            case 'DocumentVerifyError':
                setError('root', { type: 'manual', message: "Unable to verify the document. Please ensure you've uploaded a valid, non-expired document." });
                break;
            case 'TrackStringParserError':
                setError('root', { type: 'manual', message: 'Unable to parse the track string. Please check and try again.' });
                break;
            case 'CompareFacesError':
                setError('root', { type: 'manual', message: 'Unable to compare faces. Please ensure your selfie matches your document photo.' });
                break;
            case 'CaptureFacesError':
                setError('root', { type: 'manual', message: 'Unable to capture faces from the images. Please upload clearer photos.' });
                break;
            case 'RequestAlreadyProcessed':
                setError('root', { type: 'manual', message: 'This request has already been processed. Please start a new verification if needed.' });
                break;
            case 'RequestExpired':
                setError('root', { type: 'manual', message: 'This request has expired. Please start a new verification.' });
                break;
            case 'AntiSpoofing':
                setError('root', { type: 'manual', message: "The anti-spoofing check failed. Please ensure you're using a real, non-manipulated document and photo." });
                break;
            case 'NotFound':
                setError('root', { type: 'manual', message: 'The document could not be found. Please ensure you have uploaded a valid document.' });
                break;
            default:
                setError('root', { type: 'manual', message: 'An unexpected error occurred. Please try again later.' });
        }

        // If you want to handle MultipleErrors separately, you can keep this logic
        if (errorData.code === 'MultipleErrors') {
            console.error('Multiple Errors:');
            errorData.multipleErrors?.forEach((error) => {
                console.error(`- ${error.code}: ${error.message}`);
            });
        }
    }

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
