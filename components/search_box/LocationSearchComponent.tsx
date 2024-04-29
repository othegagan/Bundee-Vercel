'use client';

import { Modal, ModalBody, ModalHeader } from '@/components/custom/modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { addDays, differenceInMinutes, format } from 'date-fns';
import { useQueryState } from 'next-usequerystate';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import TimeSelect from '../custom/TimeSelect';
import LocationSearchBox from './LocationSearchBox';
import SearchCalendar from './SearchCalendar';

const LocationSearchComponent = ({ searchCity }: any) => {
    const pathname = usePathname();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

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
        const isMapSearch = queryParams.get('isMapSearch') || false;
        const zoomLevel = queryParams.get('zoomLevel') || 8;

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

        const newUrl = `/vehicles?city=${city}&latitude=${latitude}&longitude=${longitude}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}&isAirport=${isAirport}&isMapSearch=${isMapSearch}&zoomLevel=${zoomLevel}`;

        router.push(newUrl);
    };

    function openModal() {
        setShowModal(true);
    }
    function closeModal() {
        redirectToVech();
        setShowModal(false);
    }

    return (
        <>
            <div
                className={` z-[55] md:sticky ${pathname == '/' ? 'md:top-[3.75rem]' : ''} select-none   bg-white  md:block ${pathname == '/' ? 'block rounded-md' : '-mx-4 hidden'}`}>
                <div className='grid grid-cols-2 gap-5 p-4 sm:p-4 md:grid-cols-12  lg:grid-cols-12'>
                    <div className='col-span-2 md:col-span-3 lg:col-span-4'>
                        <div className='flex w-full flex-col  '>
                            <label className='mb-1 inline-flex text-xs font-semibold'>
                                Search By City{' '}
                                <span className='inline-block text-xs font-semibold text-neutral-800 sm:hidden lg:block'>, Place and Zipcode</span>
                            </label>
                            <LocationSearchBox />
                        </div>
                    </div>
                    <div className='col-span-2 md:col-span-4 lg:col-span-3'>
                        <div className='flex w-full flex-col  '>
                            <label className='mb-1 text-xs font-semibold'>Pickup & Drop Dates</label>
                            <SearchCalendar startDate={startDateQuery} setStartDate={setStartDateQuery} endDate={endDateQuery} setEndDate={setEndDateQuery} />
                        </div>
                    </div>
                    <div className='col-span-1 md:col-span-2 lg:col-span-2'>
                        <TimeSelect label='Pickup Time' onChange={setStartTimeQuery} defaultValue={startTimeQuery} className='md:w-full' />
                    </div>
                    <div className='col-span-1 md:col-span-2 lg:col-span-2'>
                        <TimeSelect label='Drop Time' onChange={setEndTimeQuery} defaultValue={endTimeQuery} className='md:w-full' />
                    </div>
                    <div className='col-span-2 md:col-span-1 lg:col-span-1'>
                        <div className='flex h-full w-full items-end justify-end'>
                            <Button onClick={redirectToVech} className='w-full'>
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            {pathname !== '/' ? (
                <>
                    <div className='rounded-md border bg-white p-2 shadow-sm md:hidden' onClick={openModal}>
                        <div className=''>{searchCity ? searchCity : null}</div>
                        <div className='mt-1 flex items-center justify-between text-xs text-neutral-500'>
                            <div className=''>
                                {startDateQuery ? format(new Date(startDateQuery + 'T00:00:00'), 'PPP') : null} |{/* @ts-ignore */}{' '}
                                {startTimeQuery ? format(new Date(0, 0, 0, ...startTimeQuery.split(':')), 'h:mm a') : null}
                            </div>
                            <div>--</div>
                            <div className=''>
                                {endDateQuery ? format(new Date(endDateQuery + 'T00:00:00'), 'PPP') : null} |{/* @ts-ignore */}{' '}
                                {endTimeQuery ? format(new Date(0, 0, 0, ...endTimeQuery.split(':')), 'h:mm a') : null}
                            </div>
                        </div>
                    </div>

                    <Modal isOpen={showModal} onClose={closeModal} className='p-0 '>
                        <ModalHeader onClose={closeModal}>{''}</ModalHeader>
                        <ModalBody className='p-0'>
                            <div className=' rounded-md bg-white '>
                                <div className='grid grid-cols-2 gap-5 md:grid-cols-12  lg:grid-cols-12'>
                                    <div className='col-span-2 md:col-span-6 lg:col-span-4'>
                                        <div className='flex w-full flex-col gap-1 '>
                                            <label className='mb-1 text-xs font-semibold'>Search By City, Place and Zipcode</label>
                                            <LocationSearchBox />
                                        </div>
                                    </div>
                                    <div className='col-span-2 md:col-span-6 lg:col-span-3'>
                                        <div className='flex w-full flex-col gap-1 '>
                                            <label className='mb-1 text-xs font-semibold'>Pickup & Drop Dates</label>
                                            <SearchCalendar
                                                startDate={startDateQuery}
                                                setStartDate={setStartDateQuery}
                                                endDate={endDateQuery}
                                                setEndDate={setEndDateQuery}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-1 md:col-span-3 lg:col-span-2'>
                                        <TimeSelect label='Pickup Time' onChange={setStartTimeQuery} defaultValue={startTimeQuery} className='md:w-full' />
                                    </div>
                                    <div className='col-span-1 md:col-span-3 lg:col-span-2'>
                                        <TimeSelect label='Drop Time' onChange={setEndTimeQuery} defaultValue={endTimeQuery} className='md:w-full' />
                                    </div>
                                    <div className='col-span-2 md:col-span-3 lg:col-span-1'>
                                        <div className='flex h-full w-full items-end justify-end'>
                                            <Button onClick={redirectToVech} className='w-full'>
                                                Search
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                    </Modal>
                </>
            ) : null}
        </>
    );
};

export default LocationSearchComponent;

{
    /* <div className='flex w-[65%] flex-col gap-1'>
    <label className='mb-1 text-xs font-semibold'>Pickup Date</label>
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant={'outline'}
                className={cn('w-full justify-start text-left font-normal', !startDateQuery && 'text-muted-foreground')}>
                <CalendarIcon className='mr-2 h-4 w-4' />
                {startDateQuery ? format(new Date(startDateQuery + 'T00:00:00'), 'PPP') : <span>Pickup date</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
            <Calendar
                mode='single'
                required
                selected={new Date(startDateQuery + 'T00:00:00')}
                onSelect={date => setUserSelectedPickupDate(date)}
                defaultMonth={new Date(startDateQuery + 'T00:00:00')}
                initialFocus
                disabled={date => date < new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
            />
        </PopoverContent>
    </Popover>
</div>



<div className='flex w-[65%] flex-col gap-1 '>
    <label className='mb-1 text-xs font-semibold'>Drop Date</label>
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant={'outline'}
                className={cn('w-full justify-start text-left font-normal', !endDateQuery && 'text-muted-foreground')}>
                <CalendarIcon className='mr-2 h-4 w-4' />
                {endDateQuery ? format(new Date(endDateQuery + 'T00:00:00'), 'PPP') : <span>Pick an drop date</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
            <Calendar
                required
                mode='single'
                selected={new Date(endDateQuery + 'T00:00:00')}
                onSelect={(date: any) => setEndDateQuery(format(date, 'yyyy-MM-dd'))}
                defaultMonth={new Date(endDateQuery + 'T00:00:00')}
                initialFocus
                // @ts-ignore
                disabled={date => date < new Date(new Date((startDateQuery + 'T00:00:00') as string) + 1 * 24 * 60 * 60 * 1000)}
            />
        </PopoverContent>
    </Popover>
</div>







*/
}
