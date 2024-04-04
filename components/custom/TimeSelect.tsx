'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimeSelect: React.FC<{ onChange: (time: string) => void; defaultValue: any; label: string, className?:string }> = ({ onChange, defaultValue, label, className }) => {
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

    return (
        <div className='flex flex-col gap-2 w-full'>
            <label className='text-xs font-semibold'>{label}</label>
            <Select onValueChange={onChange} defaultValue={defaultValue}>
                <SelectTrigger className={`md:w-[150px] ${className}`}>
                    <SelectValue placeholder='Select end time' />
                </SelectTrigger>
                <SelectContent className='max-h-60'>
                    {generateTimes.map((time: any) => (
                        <SelectItem key={time.value} value={time.value} className='cursor-pointer'>
                            {time.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default TimeSelect;
