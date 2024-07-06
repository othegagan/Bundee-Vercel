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
import type React from 'react';
import { useState } from 'react';

interface TripModificationCalendarProps {
    unavailableDates: string[];
    isTripStarted?: boolean;
    isDisabled?: boolean;
    date?: string;
    setDate?: React.Dispatch<React.SetStateAction<string>>;
    newStartDate?: string;
    setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
    setDateSelectionError?: React.Dispatch<React.SetStateAction<string>>;
}

export function TripModificationStartDateCalendar({
    unavailableDates,
    date,
    setDate,
    isTripStarted,
    setIsInitialLoad,
    isDisabled,
}: TripModificationCalendarProps) {
    const [value, setValue] = useState(parseDate(date));

    const handleDateChange = (value) => {
        setValue(value);
        const startDateFormatted = format(value.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        setDate(startDateFormatted);
        setIsInitialLoad(false);
    };

    const minValue = isTripStarted ? parseDate(date) : today(getLocalTimeZone());

    const isDateUnavailable = (dateValue) => {
        const dateStr = format(dateValue.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        return unavailableDates.includes(dateStr);
    };

    return (
        <DatePicker aria-label='Select Date' shouldCloseOnSelect={true} isDisabled={isDisabled} className={`${isDisabled && 'cursor-not-allowed'}`}>
            <DatePickerButton date={value} />
            <DatePickerContent className='flex flex-col '>
                <Calendar
                    value={value}
                    onChange={handleDateChange}
                    minValue={minValue}
                    maxValue={getFirstDateAfter(unavailableDates, date)}
                    isDisabled={isDisabled}
                    isDateUnavailable={isDateUnavailable}>
                    <CalendarHeading />
                    <CalendarGrid>
                        <CalendarGridHeader>{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                        <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                    </CalendarGrid>
                </Calendar>
            </DatePickerContent>
        </DatePicker>
    );
}

export function TripModificationEndDateCalendar({
    unavailableDates,
    date,
    setDate,
    newStartDate,
    isTripStarted,
    setIsInitialLoad,
    isDisabled,
}: TripModificationCalendarProps) {
    const [value, setValue] = useState(parseDate(date));

    const handleDateChange = (value) => {
        setValue(value);
        const startDateFormatted = format(value.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        setDate(startDateFormatted);
        setIsInitialLoad(false);
    };

    const minValue = isTripStarted ? parseDate(newStartDate) : today(getLocalTimeZone());

    const isDateUnavailable = (dateValue) => {
        const dateStr = format(dateValue.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        return unavailableDates.includes(dateStr);
    };

    return (
        <DatePicker aria-label='Select Date' shouldCloseOnSelect={true} isDisabled={isDisabled} className={`${isDisabled && 'cursor-not-allowed'}`}>
            <DatePickerButton date={value} />
            <DatePickerContent className='flex flex-col '>
                <Calendar
                    value={value}
                    onChange={handleDateChange}
                    minValue={minValue}
                    maxValue={getFirstDateAfter(unavailableDates, date)}
                    isDisabled={isDisabled}
                    isDateUnavailable={isDateUnavailable}>
                    <CalendarHeading />
                    <CalendarGrid>
                        <CalendarGridHeader>{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                        <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                    </CalendarGrid>
                </Calendar>
            </DatePickerContent>
        </DatePicker>
    );
}

function getFirstDateAfter(unAvailabilityDates: any[], givenDate: any) {
    // Convert the given date string to a Date object
    const givenDateObj = new Date(givenDate);

    // Convert all unavailability date strings to Date objects and filter out those before the given date
    const futureDates = unAvailabilityDates.map((dateStr) => new Date(`${dateStr}T00:00:00`)).filter((dateObj) => dateObj > givenDateObj);

    // If there are no future dates, return null
    if (futureDates.length === 0) {
        return null;
    }
    // Sort the future dates in ascending order
    futureDates.sort((a: any, b: any) => a - b);

    // Return the date before the first unavailable date to disable the first unavailable date
    const firstUnavailableDate = futureDates[0];
    firstUnavailableDate.setDate(firstUnavailableDate.getDate() - 1);
    return parseDate(format(firstUnavailableDate, 'yyyy-MM-dd'));
}
