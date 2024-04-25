import { useEffect, useState } from 'react';
import {
    RangeCalendar,
    CalendarHeading,
    CalendarGrid,
    CalendarGridHeader,
    CalendarGridBody,
    CalendarHeaderCell,
    CalendarCell,
} from '@/components/custom/calendar';
import { CalendarSelectSkeleton, DateSelectSkeleton } from '@/components/skeletons/skeletons';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { format, isAfter, isBefore, differenceInHours } from 'date-fns';
import { IoInformationCircleOutline } from 'react-icons/io5';
import ClientOnly from '@/components/ClientOnly';

const ModificationCalendarComponent = ({
    vehicleid,
    tripid,
    originalStartDate,
    originalEndDate,
    setError,
    setNewStartDate,
    setNewEndDate,
    setIsInitialLoad,
    tripStarted,
}: any) => {
    const [dates, setDates] = useState<any>({
        start: parseDate(originalStartDate),
        end: parseDate(originalEndDate),
    });

    const { isLoading: datesLoading, isError: datesError, unavailableDates } = useAvailabilityDates(vehicleid, tripid);

    if (datesLoading) {
        return <CalendarSelectSkeleton />;
    }

    if (datesError) {
        setError(true);
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

    // let isInvalid =
    //     isDateUnavailableStart ||
    //     isDateUnavailableEnd ||
    //     (newStartDate < originalStartDate && newEndDate < originalStartDate) ||
    //     (newStartDate > originalEndDate && newEndDate > originalEndDate) ||
    //     (newStartDate == originalStartDate && newEndDate == originalEndDate);

    let errorMessage = '';

    //   if ((newStartDate < originalStartDate && newEndDate < originalStartDate) || (newStartDate > originalEndDate && newEndDate > originalEndDate)) {
    //         errorMessage = 'Invalid Date Range';
    //         setError('Invalid Date Range');
    //     } else if (newStartDate == originalStartDate && newEndDate == originalEndDate) {
    //         errorMessage = 'Please provide alternative dates';
    //         setError('Please provide alternative dates');
    //     }

    // isInvalid ? setError(true) : setError(false);

    function onDateSelect(item: any) {
        setDates(item);

        const startDateFormatted = format(item.start.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        const endDateFormatted = format(item.end.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        setNewStartDate(startDateFormatted);
        setNewEndDate(endDateFormatted);
        setIsInitialLoad(false);
    }

    return (
        <ClientOnly>
            <div className='flex flex-col gap-2'>
                <RangeCalendar
                    className={'mt-2 w-fit select-none overflow-hidden rounded-md border border-gray-200 bg-white p-2 shadow-sm'}
                    aria-label='Date range (uncontrolled)'
                    value={dates}
                    onChange={value => onDateSelect(value)}
                    visibleDuration={{ months: 1 }}
                    pageBehavior='visible'
                    minValue={tripStarted ? dates.start : today(getLocalTimeZone())}
                    isDateUnavailable={isDateUnavailable}
                    // isInvalid={isInvalid}
                >
                    <CalendarHeading />
                    <CalendarGrid>
                        <CalendarGridHeader>{(day: any) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                        <CalendarGridBody>{(date: any) => <CalendarCell date={date} />}</CalendarGridBody>
                    </CalendarGrid>
                </RangeCalendar>

                {errorMessage ? (
                    <div className='mt-2 flex gap-2'>
                        <IoInformationCircleOutline className='text-destructive' />
                        <p className='text-sm font-normal text-destructive'>{errorMessage}</p>
                    </div>
                ) : null}
            </div>
        </ClientOnly>
    );
};

export default ModificationCalendarComponent;
