'use client';

import {
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
} from '@/components/ui/extension/calendar';
import { DatePicker, DatePickerButton, DatePickerContent } from '@/components/ui/extension/date-picker';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { format } from 'date-fns';
import React, { useState } from 'react';

interface TripModificationCalendarProps {
    unavailableDates: string[];
    newStartDate?: string;
    setNewStartDate?: React.Dispatch<React.SetStateAction<string>>;
    isTripStarted?: boolean;
    getPriceCalculation: () => void;
    setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
    isDisabled?: boolean;
}

export function TripModificationCalendar({
    unavailableDates,
    newStartDate,
    setNewStartDate,
    isTripStarted,
    getPriceCalculation,
    setIsInitialLoad,
    isDisabled,
}: TripModificationCalendarProps) {
    const [date, setDate] = useState(parseDate(newStartDate));

    const handleDateChange = value => {
        setDate(value);
        const startDateFormatted = format(value.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        setNewStartDate(startDateFormatted);
        setIsInitialLoad(false);
    };

    const givenDate = newStartDate;
    const minValue = isTripStarted ? parseDate(newStartDate) : today(getLocalTimeZone());
    return (
        <DatePicker aria-label='Select Date' shouldCloseOnSelect={true} isDisabled={isDisabled} className={`${isDisabled && 'cursor-not-allowed'}`}>
            <DatePickerButton date={date} />
            <DatePickerContent className='flex flex-col'>
                <Calendar
                    value={date}
                    onChange={handleDateChange}
                    minValue={minValue}
                    maxValue={getFirstDateAfter(unavailableDates, givenDate)}
                    isDisabled={isDisabled}>
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
