import { useEffect, useState } from 'react';
import { RangeCalendar, CalendarHeading, CalendarGrid, CalendarGridHeader, CalendarGridBody, CalendarHeaderCell, CalendarCell } from '@/components/custom/calendar';
import { CalendarSelectSkeleton, DateSelectSkeleton } from '@/components/skeletons/skeletons';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { format, isAfter, isBefore } from 'date-fns';
import { IoInformationCircleOutline } from 'react-icons/io5';
import ClientOnly from '@/components/ClientOnly';

const ModificationCalendarComponent = ({
    vehicleid,
    setNewStartDate,
    setNewEndDate,
    originalStartDate,
    originalEndDate,
    newStartDate,
    newEndDate,
    setError,
    setIsExtensionNeeded,
    handleReductionCase,
    handleExtensionCase,
    tripid,
}: any) => {
    const [dates, setDates] = useState<any>({
        start: parseDate(originalStartDate),
        end: parseDate(originalEndDate),
    });

    useEffect(() => {
        if (newStartDate && newEndDate) {
            if (isAfter(new Date(newStartDate), new Date(originalStartDate)) || isBefore(new Date(newEndDate), new Date(originalEndDate))) {
                handleReductionCase();
                setIsExtensionNeeded(false);
                console.log('Prices For Reduction');
            } else if (isBefore(new Date(newStartDate), new Date(originalStartDate)) || isAfter(new Date(newEndDate), new Date(originalEndDate))) {
                handleExtensionCase();
                setIsExtensionNeeded(true);
                // console.log('Prices For Extension');
            }
        }
    }, [newStartDate, newEndDate]);

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

    let isInvalid =
        isDateUnavailableStart ||
        isDateUnavailableEnd ||
        (newStartDate < originalStartDate && newEndDate < originalStartDate) ||
        (newStartDate > originalEndDate && newEndDate > originalEndDate) ||
        (newStartDate == originalStartDate && newEndDate == originalEndDate);

    let errorMessage = '';

    if (isDateUnavailableStart) {
        errorMessage = 'Start date is unavailable.';
    } else if (isDateUnavailableEnd) {
        errorMessage = 'End date is unavailable.';
    } else if ((newStartDate < originalStartDate && newEndDate < originalStartDate) || (newStartDate > originalEndDate && newEndDate > originalEndDate)) {
        errorMessage = 'Invalid Date Range';
        setError('Invalid Date Range');
    } else if (newStartDate == originalStartDate && newEndDate == originalEndDate) {
        errorMessage = 'Please provide alternative dates';
        setError('Please provide alternative dates');
    }

    isInvalid ? setError(true) : setError(false);

    function onDateSelect(item: any) {
        setDates(item);

        const startDateFormatted = format(item.start.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        const endDateFormatted = format(item.end.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        setNewStartDate(startDateFormatted);
        setNewEndDate(endDateFormatted);

        // if (newStartDate && newEndDate) {
        //     if (isAfter(new Date(newStartDate), new Date(originalStartDate)) || isBefore(new Date(newEndDate), new Date(originalEndDate))) {
        //         handleReductionCase();
        //         // console.log('Prices For Reduction');
        //     } else if (isBefore(new Date(newStartDate), new Date(originalStartDate)) || isAfter(new Date(newEndDate), new Date(originalEndDate))) {
        //         handleExtensionCase();
        //         // console.log('Prices For Extension');
        //     }
        // }
    }

    return (
        <ClientOnly>
            <div className='flex flex-col gap-2'>
                <RangeCalendar
                    className={'w-fit select-none border border-gray-200 mt-2 rounded-md overflow-hidden shadow-sm bg-white p-2'}
                    aria-label='Date range (uncontrolled)'
                    value={dates}
                    onChange={value => onDateSelect(value)}
                    visibleDuration={{ months: 1 }}
                    pageBehavior='visible'
                    minValue={today(getLocalTimeZone())}
                    isDateUnavailable={isDateUnavailable}
                    isInvalid={isInvalid}>
                    <CalendarHeading />
                    <CalendarGrid>
                        <CalendarGridHeader>{(day: any) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                        <CalendarGridBody>{(date: any) => <CalendarCell date={date} />}</CalendarGridBody>
                    </CalendarGrid>
                </RangeCalendar>

                {errorMessage ? (
                    <div className='flex gap-2 mt-2'>
                        <IoInformationCircleOutline className='text-destructive' />
                        <p className='text-sm font-normal text-destructive'>{errorMessage}</p>
                    </div>
                ) : null}
            </div>
        </ClientOnly>
    );
};

export default ModificationCalendarComponent;
