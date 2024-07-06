'use client';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/extension/button';
import {
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
    RangeCalendar,
} from '@/components/ui/extension/calendar';
import { DatePickerContent, DateRangePicker } from '@/components/ui/extension/date-picker';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { cn } from '@/lib/utils';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Group } from 'react-aria-components';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { useMediaQuery } from 'react-responsive';
import { DateSelectSkeleton } from '../../../components/skeletons/skeletons';

const DateRangeCalendar = ({ vehicleid, setStartDate, setEndDate, startDate, endDate, setSelectedDatesError }: any) => {
    const [dates, setDates] = useState<any>({
        start: parseDate(startDate),
        end: parseDate(endDate),
    });

    const { isLoading: datesLoading, isError: datesError, unavailableDates, minDays, maxDays } = useAvailabilityDates(vehicleid, null);
    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });

    if (datesLoading) {
        return <DateSelectSkeleton />;
    }

    if (datesError) {
        setSelectedDatesError(true);
        return <div>Something went wrong</div>;
    }

    const blockedDates = unavailableDates.map((date) => [parseDate(date), parseDate(date)]) || [];

    const isDateUnavailable = (date) => blockedDates.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

    const isDateUnavailableStart = blockedDates.length > 0 && isDateUnavailable(dates.start);
    const isDateUnavailableEnd = blockedDates.length > 0 && isDateUnavailable(dates.end);

    const isInvalid =
        (minDays !== 0 && dates.end.compare(dates.start) + 1 < minDays) ||
        (maxDays !== 0 && dates.end.compare(dates.start) + 1 > maxDays) ||
        isDateUnavailableStart ||
        isDateUnavailableEnd;

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

        const daysDifference = (dates.end.toDate(getLocalTimeZone()) - dates.start.toDate(getLocalTimeZone())) / (24 * 60 * 60 * 1000);
        if (minDays !== 0 && daysDifference + 1 < minDays) {
            return `This car has a minimum trip length requirement of ${minDays} days. Please extend your trip days.`;
        }

        if (maxDays !== 0 && daysDifference + 1 > maxDays) {
            return `This car has a maximum trip length requirement of ${maxDays} days. Please reduce your trip days.`;
        }

        return '';
    };

    errorMessage = getErrorMessage(dates);

    setSelectedDatesError(isInvalid);

    function onDateSelect(item) {
        setDates(item);
        setStartDate(format(item.start.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
        setEndDate(format(item.end.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
    }

    // Check if the current time is above 9PM and if so, add an extra day to the minimum date
    const isPast9PM = new Date().getHours() >= 21;
    const minValueDate = today(getLocalTimeZone()).add({ days: isPast9PM ? 1 : 0 });

    return (
        <div>
            <ClientOnly>
                <label className='text-[15px] font-semibold'>Trip Dates</label>

                <DateRangePicker aria-label='Select Date' shouldCloseOnSelect={true}>
                    <Group>
                        <Button
                            variant='outline'
                            className={cn(
                                'mt-2 flex w-full cursor-pointer items-center justify-start rounded-md  border border-gray-200 px-3 py-2 text-left text-sm font-normal  ',
                                !dates && 'text-muted-foreground',
                            )}>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {dates?.end ? (
                                <>
                                    {format(dates.start.toDate(getLocalTimeZone()), 'LLL dd, y')} - {format(dates.end.toDate(getLocalTimeZone()), 'LLL dd, y')}
                                </>
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
                        <p className='text-xs font-normal text-destructive'>{errorMessage}</p>
                    </div>
                ) : null}
            </ClientOnly>
        </div>
    );
};

export default DateRangeCalendar;
