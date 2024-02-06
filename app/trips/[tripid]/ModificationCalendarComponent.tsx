'use client';

import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/custom/button';
import { CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, CalendarHeading, RangeCalendar } from '@/components/custom/calendar';
import { DatePickerContent, DateRangePicker } from '@/components/custom/date-picker';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { cn } from '@/lib/utils';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { DateValue, Group } from 'react-aria-components';
import { useMediaQuery } from 'react-responsive';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { DateSelectSkeleton } from '@/components/skeletons/skeletons';

const ModificationCalendarComponent = ({ vehicleid, setNewStartDate, setNewEndDate, newStartDate, newEndDate, originalStartDate, originalEndDate, setError }: any) => {
    const [dates, setDates] = useState<any>({
        start: parseDate(originalStartDate),
        end: parseDate(originalEndDate),
    });

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

    let isInvalid = isDateUnavailableStart || isDateUnavailableEnd;

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
    }

    function onDateSelect(item: any) {
        setDates(item);
        setNewStartDate(format(item.start.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
        setNewEndDate(format(item.end.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
    }

    return (
        <div>
            <div>
                <ClientOnly>
                    <RangeCalendar
                        className={'w-fit select-none border border-gray-200 mt-2 rounded-md overflow-hidden shadow-sm bg-white p-2'}
                        aria-label='Date range (uncontrolled)'
                        value={dates}
                        onChange={value => onDateSelect(value)}
                        visibleDuration={{ months: isTabletOrLarger ? 2 : 1 }}
                        pageBehavior='visible'
                        minValue={today(getLocalTimeZone())}
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

                    {errorMessage ? (
                        <div className='flex gap-2 mt-2'>
                            <IoInformationCircleOutline className='text-destructive' />
                            <p className='text-xs font-normal text-destructive'>{errorMessage}</p>
                        </div>
                    ) : null}
                </ClientOnly>
            </div>
        </div>
    );
};

export default ModificationCalendarComponent;
