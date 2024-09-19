'use client';

import { Button } from '@/components/ui/button';
import { Trash, Upload } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useRef, useState } from 'react';

interface FileUploaderProps {
    setError: any;
    onFileSelect: (files: File[]) => void;
    maxFileSize?: number; // in bytes, default 4MB
    maxFiles?: number; // max number of files allowed
}

export default function FileUploader({ onFileSelect, setError, maxFileSize = 2 * 1024 * 1024, maxFiles = 10 }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, []);

    const onFileDrop = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        handleFiles(selectedFiles);
    }, []);

    const handleFiles = (selectedFiles: File[]) => {
        setError(null);
        const allowedFiles: File[] = [];
        const exceededSizeFiles: File[] = [];
        const duplicateFiles: string[] = [];
        const existingFileNames = files.map((file) => file.name.toLowerCase());

        selectedFiles.forEach((file) => {
            const fileName = file.name.toLowerCase();

            if (existingFileNames.includes(fileName)) {
                // If file is a duplicate
                duplicateFiles.push(file.name);
            } else if (file.size > maxFileSize) {
                // If file exceeds size limit
                exceededSizeFiles.push(file);
            } else if (!file.type.includes('image/') && !file.type.includes('video/')) {
                // If file is not an image or video
                setError(`File ${file.name} is not supported. Only images and videos are allowed.`);
            } else {
                // If file is valid
                allowedFiles.push(file);
                existingFileNames.push(fileName);
            }
        });

        if (files.length + allowedFiles.length > maxFiles) {
            setError(`You can upload a maximum of ${maxFiles} files.`);
            return;
        }

        if (exceededSizeFiles.length > 0) {
            setError(`Some files exceed the maximum size limit (${maxFileSize / (1024 * 1024)}MB) and won't be uploaded.`);
        }

        if (duplicateFiles.length > 0) {
            setError(`Duplicate files detected: ${duplicateFiles.join(', ')} won't be uploaded.`);
        }

        setFiles((prevFiles) => [...prevFiles, ...allowedFiles]);

        // Generate previews for the allowed files
        allowedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prevPreviews) => [...prevPreviews, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        // Pass the valid files to the parent component
        onFileSelect(allowedFiles);
    };

    const removeFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    };

    return (
        <div className={`w-full grid grid-cols-1 gap-4 md:gap-6 ${files.length > 0 ? 'md:grid-cols-2' : ''}`}>
            <div
                className={`relative flex min-h-44 h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition duration-150 ease-in-out ${
                    isDragging ? 'border-primary bg-primary/10' : 'border-2 border-neutral-200 bg-muted hover:border-primary hover:bg-primary/5'
                }`}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}>
                <Upload className='h-10 w-10 text-muted-foreground' />
                <p className='mt-2 text-sm text-muted-foreground'>Click to upload or drag and drop</p>
                <p className='text-xs text-muted-foreground'>Max. File Size: {maxFileSize / (1024 * 1024)}MB</p>
                <input ref={fileInputRef} type='file' accept='image/*, video/*' multiple onChange={onFileDrop} className='hidden' />
            </div>

            {files.length > 0 && (
                <div className='space-y-2 max-h-72 overflow-y-auto'>
                    {files.map((file, index) => (
                        <div key={index} className='flex items-center justify-between gap-2 text-sm'>
                            <div className='flex items-center gap-2'>
                                {previews[index] && <Image src={previews[index]} alt={file.name} width={100} height={80} className='rounded object-cover' />}
                                <span className='truncate max-w-[150px]'>{file.name}</span>
                            </div>
                            <Button size='icon' variant='ghost' onClick={() => removeFile(index)}>
                                <Trash className='h-4 w-4' />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
