'use client';

import { Button } from '@/components/ui/extension/button';
import {
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
} from '@/components/ui/extension/calendar';
import { DatePicker, DatePickerContent } from '@/components/ui/extension/date-picker';
import { cn } from '@/lib/utils';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Group, type DateValue } from 'react-aria-components';

interface TripModificationCalendarProps {
    unavailableDates: string[];
    newStartDate?: string;
    setNewStartDate?: React.Dispatch<React.SetStateAction<string>>;
    isTripStarted?: boolean;
}

export function TripModificationCalendar({ unavailableDates, newStartDate, setNewStartDate, isTripStarted }: TripModificationCalendarProps) {

    console.log(newStartDate)

    const [date, setDate] = useState(parseDate(newStartDate));

    const handleDateChange = value => {
        setDate(value);
        // setNewStartDate(format(value?.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
    };

    const givenDate = newStartDate;
    const minValue = isTripStarted ? parseDate(newStartDate) : today(getLocalTimeZone());

    return (
        <DatePicker aria-label='Select Date' shouldCloseOnSelect={true}>
            <Group>
                <Button variant='outline' className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date?.toDate(getLocalTimeZone()), 'PPP') : <span>Pick a date</span>}
                </Button>
            </Group>
            <DatePickerContent className='flex flex-col'>
                <Calendar value={date} onChange={handleDateChange} minValue={minValue} maxValue={getFirstDateAfter(unavailableDates, givenDate)}>
                    <CalendarHeading />
                    <CalendarGrid>
                        <CalendarGridHeader>{day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                        <CalendarGridBody>{date => <CalendarCell date={date} />}</CalendarGridBody>
                    </CalendarGrid>
                </Calendar>
            </DatePickerContent>
        </DatePicker>
    );
}

function getFirstDateAfter(unAvailabilityDates, givenDate) {
    // Convert the given date string to a Date object
    const givenDateObj = new Date(givenDate);

    // Convert all unavailability date strings to Date objects and filter out those before the given date
    const futureDates = unAvailabilityDates.map(dateStr => new Date(dateStr)).filter(dateObj => dateObj > givenDateObj);

    // If there are no future dates, return null
    if (futureDates.length === 0) {
        return null;
    }

    // Sort the future dates in ascending order
    futureDates.sort((a, b) => a - b);

    // Return the first date as a DateValue object
    return parseDate(futureDates[0].toISOString().split('T')[0]);
}
