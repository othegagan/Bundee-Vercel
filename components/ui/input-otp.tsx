'use client';

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
            renderInput={(inputProps) => <Input {...inputProps} className={cn('no-spinner !h-12 !w-12 !appearance-none relative m-0 flex ', className)} />}
            containerStyle={`flex justify-center items-center flex-wrap  text-3xl font-medium ${props.renderSeparator ? 'gap-1' : 'gap-x-3 gap-y-2'}`}
        />
    );
};
