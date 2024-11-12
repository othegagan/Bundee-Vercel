'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import OtpInput, { type OTPInputProps } from 'react-otp-input';

type OtpOptions = Omit<OTPInputProps, 'renderInput'>;

type OtpStyledInputProps = {
    className?: string;
} & OtpOptions;

export const OtpStyledInput = ({ className, containerStyle, ...props }: OtpStyledInputProps) => {
    return (
        <OtpInput
            {...props}
            renderInput={(inputProps) => (
                <Input {...inputProps} className={cn('no-spinner !h-9 !w-9 !appearance-none lg:!h-12 lg:!w-12 relative m-0 flex lg:text-xl ', className)} />
            )}
            containerStyle={cn(
                'flex justify-around items-center gap-1  text-3xl  font-medium mx-auto w-full max-w-[350px] overflow-x-hidden py-1',
                props.renderSeparator ? 'gap-1' : ' gap-y-2',
                containerStyle
            )}
        />
    );
};
