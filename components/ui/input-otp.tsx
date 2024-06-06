'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import OtpInput, { OTPInputProps } from 'react-otp-input';

type OtpOptions = Omit<OTPInputProps, 'renderInput'>;

type OtpStyledInputProps = {
    className?: string;
} & OtpOptions;

export const OtpStyledInput = ({ className, ...props }: OtpStyledInputProps) => {
    return (
        <OtpInput
            {...props}
            renderInput={inputProps => <Input {...inputProps} className={cn('relative flex !h-12 !w-12 no-spinner !appearance-none m-0  ', className)} />}
            containerStyle={`flex justify-center items-center flex-wrap  text-3xl font-medium ${props.renderSeparator ? 'gap-1' : 'gap-x-3 gap-y-2'}`}
        />
    );
};
