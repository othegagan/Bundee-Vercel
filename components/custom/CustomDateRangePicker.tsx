'use client';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/custom/button';
import { CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, CalendarHeading, RangeCalendar } from '@/components/custom/calendar';
import { DatePickerContent, DateRangePicker } from '@/components/custom/date-picker';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { cn } from '@/lib/utils';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { CalendarIcon } from '@radix-ui/react-icons';
import { addDays, format } from 'date-fns';
import { useState } from 'react';
import { DateValue, Group } from 'react-aria-components';
import { useMediaQuery } from 'react-responsive';
import { DateSelectSkeleton } from '../skeletons/skeletons';
import { IoInformationCircleOutline } from "react-icons/io5";




const CustomDateRangePicker = ({ vehicleid, setStartDate, setEndDate, startDate, endDate, setError }: any) => {
    const [dates, setDates] = useState<any>({
        start: parseDate(startDate),
        end: parseDate(endDate),
    });
    // console.log(dates)

    const { isLoading: datesLoading, isError: datesError, unavailableDates, minDays, maxDays } = useAvailabilityDates(vehicleid);
    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });

    if (datesLoading) {
        return <DateSelectSkeleton />;
    }

    datesError ? setError(true) : null;
    if (datesError) {
        return <div>Something went wrong</div>;
    }

    const blockedDates: [any, any][] = unavailableDates.map((date: any) => [parseDate(date), parseDate(date)]) || [];

    const isDateUnavailable = (date: DateValue) => blockedDates.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

    let isDateUnavailableStart = false;
    let isDateUnavailableEnd = false;

    if (blockedDates.length > 0) {
        isDateUnavailableStart = isDateUnavailable(dates.start);
        isDateUnavailableEnd = isDateUnavailable(dates.end);
    }

    let isInvalid =
        (minDays !== 0 && dates.end.compare(dates.start) + 1 < minDays) ||
        (maxDays !== 0 && dates.end.compare(dates.start) + 1 > maxDays) ||
        isDateUnavailableStart ||
        isDateUnavailableEnd;

    isInvalid ? setError(true) : setError(false);

    const currentDate = today(getLocalTimeZone());
    let errorMessage = '';

    // Check if start date is unavailable
    if (isDateUnavailableStart) {
        errorMessage = 'Start date is unavailable.';
    } else if (isDateUnavailableEnd) {
        // Check if end date is unavailable
        errorMessage = 'End date is unavailable.';
    } else if (dates.start.toDate(getLocalTimeZone()) < currentDate) {
        // Check if start date is earlier than today
        errorMessage = 'Selected start date cannot be earlier than today.';
    } else {
        // Check if the selected date range meets minimum and maximum allowed days
        const daysDifference = (dates.end.toDate(getLocalTimeZone()) - dates.start.toDate(getLocalTimeZone())) / (24 * 60 * 60 * 1000);

        if (minDays !== 0 && daysDifference + 1 < minDays) {
            errorMessage = `This car has a minimum trip length requirement of ${minDays} days. Please extend your trip days.`;
        } else if (maxDays !== 0 && daysDifference + 1 > maxDays) {
            errorMessage = `This car has a maximum trip length requirement of ${maxDays} days. Please reduce your trip days.`;
        }
    }

    function onDateSelect(item: any) {
        setDates(item);
        setStartDate(format(item.start.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
        setEndDate(format(item.end.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
    }

    return (
        <div>
            <ClientOnly>
                <label className='text-xs font-bold'>Trip Dates</label>

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
                            onChange={value => onDateSelect(value)}
                            visibleDuration={{ months: isTabletOrLarger ? 2 : 1 }}
                            pageBehavior='visible'
                            minValue={parseDate(format(addDays(new Date(), 2), 'yyyy-MM-dd'))}
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
                    <div className='flex gap-2 mt-2'>
                        <IoInformationCircleOutline className="text-destructive"/>
                        <p className='text-xs font-normal text-destructive'>{errorMessage}</p>
                    </div>
                ) : null}
            </ClientOnly>
        </div>
    );
};

export default CustomDateRangePicker;
