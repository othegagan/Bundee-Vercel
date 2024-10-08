'use client';

import ClientOnly from '@/components/ClientOnly';
import { DateSelectSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/extension/button';
import {
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
    RangeCalendar
} from '@/components/ui/extension/calendar';
import { DatePickerContent, DateRangePicker } from '@/components/ui/extension/date-picker';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { cn } from '@/lib/utils';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { Group } from 'react-aria-components';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { useMediaQuery } from 'react-responsive';

interface DateRangeCalendarProps {
    vehicleid: number;
    setStartDate: any;
    setEndDate: any;
    startDate: any;
    endDate: any;
    setDatesSelectionError: any;
    zipCode: any;
    startTime: any;
    endTime: any;
    totalDays?: any;
}

const DateRangeCalendar = ({
    vehicleid,
    setStartDate,
    setEndDate,
    startDate,
    endDate,
    setDatesSelectionError,
    zipCode,
    startTime,
    endTime,
    totalDays
}: DateRangeCalendarProps) => {
    const [dates, setDates] = useState<any>({
        start: parseDate(`${startDate}`),
        end: parseDate(`${endDate}`)
    });

    const { isLoading: datesLoading, isError: datesError, unavailableDates, minDays, maxDays } = useAvailabilityDates(vehicleid, null, zipCode);
    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });

    if (datesLoading) {
        return <DateSelectSkeleton />;
    }

    if (datesError) {
        setDatesSelectionError(true);
        return <div>Something went wrong</div>;
    }

    const blockedDates = unavailableDates.map((date) => [parseDate(date), parseDate(date)]) || [];

    const isDateUnavailable = (date) => blockedDates.some((interval) => date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0);

    const isDateUnavailableStart = blockedDates.length > 0 && isDateUnavailable(dates.start);
    const isDateUnavailableEnd = blockedDates.length > 0 && isDateUnavailable(dates.end);

    const isInvalid = (minDays !== 0 && totalDays < minDays) || (maxDays !== 0 && totalDays > maxDays) || isDateUnavailableStart || isDateUnavailableEnd;

    const currentDate = today(getLocalTimeZone());
    let errorMessage = '';

    const getErrorMessage = (dates) => {
        if (isDateUnavailableStart) {
            return 'Start date is unavailable.';
        }

        if (isDateUnavailableEnd) {
            return 'End date is unavailable.';
        }

        if (dates.start.toDate(getLocalTimeZone()) < currentDate) {
            return 'Selected start date cannot be earlier than today.';
        }

        if (minDays !== 0 && totalDays < minDays) {
            return `This car has a minimum trip length requirement of ${minDays} days. Please extend your trip days.`;
        }

        if (maxDays !== 0 && totalDays > maxDays) {
            return `This car has a maximum trip length requirement of ${maxDays} days. Please reduce your trip days.`;
        }

        return '';
    };

    errorMessage = getErrorMessage(dates);

    function onDateSelect(item) {
        setDates(item);
        setStartDate(format(item.start.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
        setEndDate(format(item.end.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
    }

    // Check if the current time is above 9PM and if so, add an extra day to the minimum date
    const isPast9PM = new Date().getHours() >= 21;
    const minValueDate = today(getLocalTimeZone()).add({ days: isPast9PM ? 1 : 0 });

    setDatesSelectionError(isInvalid);

    return (
        <div>
            <ClientOnly>
                <label className='font-semibold text-[15px]'>Trip Dates</label>

                <DateRangePicker aria-label='Select Date' shouldCloseOnSelect={true}>
                    <Group>
                        <Button
                            variant='outline'
                            className={cn(
                                'mt-2 flex w-full cursor-pointer items-center justify-start rounded-md border border-gray-200 px-3 py-2 text-left font-normal text-sm ',
                                !dates && 'text-muted-foreground'
                            )}>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {dates?.end ? (
                                <div>
                                    {format(dates.start.toDate(getLocalTimeZone()), 'LLL dd, y')} - {format(dates.end.toDate(getLocalTimeZone()), 'LLL dd, y')}
                                </div>
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </Group>

                    <DatePickerContent>
                        <RangeCalendar
                            className={'w-fit select-none'}
                            aria-label='Date range (uncontrolled)'
                            value={dates}
                            onChange={(value) => onDateSelect(value)}
                            visibleDuration={{ months: isTabletOrLarger ? 2 : 1 }}
                            pageBehavior='visible'
                            minValue={minValueDate}
                            isDateUnavailable={isDateUnavailable}
                            isInvalid={isInvalid}>
                            <CalendarHeading />
                            <div className='hidden gap-6 overflow-auto md:flex'>
                                <CalendarGrid>
                                    <CalendarGridHeader>{(day: any) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                                    <CalendarGridBody>{(date: any) => <CalendarCell date={date} />}</CalendarGridBody>
                                </CalendarGrid>
                                <CalendarGrid offset={{ months: 1 }}>
                                    <CalendarGridHeader>{(day: any) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                                    <CalendarGridBody>{(date: any) => <CalendarCell date={date} />}</CalendarGridBody>
                                </CalendarGrid>
                            </div>
                            <div className='flex gap-6 overflow-auto md:hidden'>
                                <CalendarGrid>
                                    <CalendarGridHeader>{(day: any) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                                    <CalendarGridBody>{(date: any) => <CalendarCell date={date} />}</CalendarGridBody>
                                </CalendarGrid>
                            </div>
                        </RangeCalendar>
                    </DatePickerContent>
                </DateRangePicker>

                {errorMessage ? (
                    <div className='mt-2 flex gap-2'>
                        <IoInformationCircleOutline className='text-destructive' />
                        <p className='font-normal text-destructive text-xs'>{errorMessage}</p>
                    </div>
                ) : null}
            </ClientOnly>
        </div>
    );
};

export default DateRangeCalendar;
