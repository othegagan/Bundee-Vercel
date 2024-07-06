'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';

interface TimeSelectProps {
    onChange: any;
    defaultValue: any;
    label: string;
    className?: string;
    disableLimitTime?: any;
    variant?: 'sm' | 'md';
    isDisabled?: boolean;
}

const TimeSelect = ({ onChange, defaultValue, label, className, disableLimitTime, variant = 'md', isDisabled = false }: TimeSelectProps) => {
    const generateTimes = React.useMemo(() => {
        return Array.from({ length: 48 }, (_, i) => {
            const hour24 = Math.floor(i / 2);
            const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
            const period = hour24 >= 12 ? 'PM' : 'AM';
            const minutes = i % 2 === 0 ? '00' : '30';
            const label = `${hour12}:${minutes} ${period}`;
            const value = `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
            return { label, value };
        });
    }, []); // Memoize the generated times array

    const labelVariants = {
        sm: 'text-xs',
        md: 'text-14',
    };

    return (
        <div className='flex w-full flex-col gap-2'>
            <label className={cn('font-semibold', labelVariants[variant])}>{label}</label>
            <Select onValueChange={onChange} defaultValue={defaultValue} disabled={isDisabled}>
                <SelectTrigger className={`md:w-[150px] ${className}`}>
                    <SelectValue placeholder='Select end time' />
                </SelectTrigger>
                <SelectContent className='max-h-60'>
                    {generateTimes.map((time) => (
                        <SelectItem
                            key={time.value}
                            value={time.value}
                            className='cursor-pointer disabled:!hidden'
                            disabled={disableLimitTime && time.value < disableLimitTime}>
                            {time.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default TimeSelect;
