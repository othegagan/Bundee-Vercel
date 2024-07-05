'use client';

import LocationSearchBox from '@/components/search_box/LocationSearchBox';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { addDays, differenceInMinutes, format } from 'date-fns';
import { useQueryState } from 'next-usequerystate';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
import { parseDate } from '@internationalized/date';

export default function HostPageSearchBox() {
    const router = useRouter();
    const [startDateQuery, setStartDateQuery] = useQueryState('startDate', { defaultValue: format(addDays(new Date(), 2), 'yyyy-MM-dd'), history: 'replace' });
    const [endDateQuery, setEndDateQuery] = useQueryState('endDate', { defaultValue: format(addDays(new Date(), 5), 'yyyy-MM-dd'), history: 'replace' });

    const [startTimeQuery, setStartTimeQuery] = useQueryState('startTime', { defaultValue: '10:00:00', history: 'replace' });
    const [endTimeQuery, setEndTimeQuery] = useQueryState('endTime', { defaultValue: '10:00:00', history: 'replace' });

    function setUserSelectedPickupDate(date: any, daysToAdd: number = 3) {
        const pickupDate = new Date(date);
        setStartDateQuery(format(pickupDate, 'yyyy-MM-dd'));

        const dropDate = new Date(date);
        dropDate.setDate(dropDate.getDate() + daysToAdd);
        setEndDateQuery(format(dropDate, 'yyyy-MM-dd'));
    }

    useEffect(() => {
        try {
            window.parent.postMessage({ type: 'revert' }, '*');
        } catch (error) {
            console.log(error.message);
        }
    }, []);

    const redirectToVech = () => {
        const queryParams = new URLSearchParams(window.location.search);
        const city = queryParams.get('city') || 'Austin, Texas, United States';
        const latitude = queryParams.get('latitude') || '-97.7437';
        const longitude = queryParams.get('longitude') || '30.271129';
        const startDate = queryParams.get('startDate') || startDateQuery;
        const endDate = queryParams.get('endDate') || endDateQuery;
        const startTime = queryParams.get('startTime') || startTimeQuery;
        const endTime = queryParams.get('endTime') || endTimeQuery;
        const isAirport = queryParams.get('isAirport') || false;

        const fullStartDate = `${startDate}T${startTime}`;
        const fullEndDate = `${endDate}T${endTime}`;

        const diff = differenceInMinutes(new Date(fullEndDate), new Date(fullStartDate));

        if (diff <= 0) {
            const startTimeFormatted = format(new Date(fullStartDate), 'hh:mm a');
            const endTimeFormatted = format(new Date(fullEndDate), 'hh:mm a');
            const startDateFormatted = format(new Date(fullStartDate), 'PPP');
            const endDateFormatted = format(new Date(fullEndDate), 'PPP');
            toast({
                duration: 4500,
                variant: 'destructive',
                title: 'Date Selection Error',
                description: `Drop off date (${endDateFormatted}, ${endTimeFormatted}) cannot be earlier than start date (${startDateFormatted}, ${startTimeFormatted}).`,
            });
            return;
        }

        const newUrl = `/vehicles?city=${city}&latitude=${latitude}&longitude=${longitude}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}&isAirport=${isAirport}`;

        redirectParentWindow();
        router.push(newUrl);
    };
    // console.log('parent window link', window.parent.location.href);

    function redirectParentWindow() {
        try {
            window.parent.postMessage({ type: 'redirectTo' }, '*');
        } catch (error) {
            console.log(error.message);
        }
    }

    return (
        <>
            <div className="rounded-md bg-white  shadow-md">
                <div className='gap-4 px-4 py-6 sm:px-8  sm:py-7 lg:flex lg:items-end '>
                    <div className='mb-4 flex w-full lg:mb-0'>
                        <div className='flex w-full flex-col gap-1 '>
                            <label className='mb-1 text-xs font-semibold'>Search By City, Place and Zip code</label>
                            <LocationSearchBox />
                        </div>
                    </div>

                    <div className='flex w-full flex-col  gap-4 md:flex-row md:items-end'>
                        <div className='flex w-[100%] flex-col gap-1'>
                            <label className='mb-1 text-xs font-semibold'>Pickup Date</label>
                            <DatePicker
                                aria-label='Select Date'
                                shouldCloseOnSelect={true}
                                onChange={date => {
                                    setUserSelectedPickupDate(date);
                                }}
                                defaultValue={parseDate(startDateQuery)}
                                minValue={parseDate(format(addDays(new Date(), 2), 'yyyy-MM-dd'))}>
                                <DatePickerButton date={parseDate(startDateQuery)} />
                                <DatePickerContent>
                                    <Calendar>
                                        <CalendarHeading />
                                        <CalendarGrid>
                                            <CalendarGridHeader>{day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                                            <CalendarGridBody>
                                                {date => (
                                                    <>
                                                        <CalendarCell date={date} />
                                                    </>
                                                )}
                                            </CalendarGridBody>
                                        </CalendarGrid>
                                    </Calendar>
                                </DatePickerContent>
                            </DatePicker>
                        </div>

                        <div className='flex w-[100%] flex-col gap-1 '>
                            <label className='mb-1 text-xs font-semibold'>Drop Date</label>

                            <DatePicker
                                aria-label='Select Date'
                                shouldCloseOnSelect={true}
                                onChange={value => {
                                    //@ts-ignore
                                    setEndDateQuery(format(new Date(value), 'yyyy-MM-dd'));
                                }}
                                defaultValue={parseDate(endDateQuery)}
                                minValue={parseDate(startDateQuery)}>
                                <DatePickerButton date={parseDate(endDateQuery)} />
                                <DatePickerContent>
                                    <Calendar>
                                        <CalendarHeading />
                                        <CalendarGrid>
                                            <CalendarGridHeader>{day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                                            <CalendarGridBody>
                                                {date => (
                                                    <>
                                                        <CalendarCell date={date} />
                                                    </>
                                                )}
                                            </CalendarGridBody>
                                        </CalendarGrid>
                                    </Calendar>
                                </DatePickerContent>
                            </DatePicker>
                        </div>

                        <Button onClick={redirectToVech}>Search</Button>
                    </div>
                </div>
            </div>
        </>
    );
}
