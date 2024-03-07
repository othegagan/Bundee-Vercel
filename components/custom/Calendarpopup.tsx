'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Calendar } from '../ui/calendar';
import React from 'react';
import { addDays, format, set } from 'date-fns';
import { DialogClose } from '@radix-ui/react-dialog';
import { CalendarIcon } from '@heroicons/react/20/solid';
import { getAvailabilityDatesByVehicleId } from '@/app/_actions/get_availability_dates_by_vehicle_id';
import { FaChevronRight } from 'react-icons/fa6';

export function DialogDemo({ vehicleid, setParentError, setPickupDate, setDropDate, pickupDate, dropDate }) {
    const [vehicleUnavailableDates, setVehicleUnavailableDates] = useState([]);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [preDate, setPreDate] = useState(null);
    const [minDays, setMinDays] = useState(null);
    const [maxDays, setMaxDays] = useState(null);

    const today = new Date();

    const [date, setDate] = useState({
        from: new Date(pickupDate) || today,
        to: new Date(dropDate) || addDays(today, 2),
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token_login') || '';
                const data = await getAvailabilityDatesByVehicleId( vehicleid,null, token);
                const { vehicleBusinessConstraints, unAvailabilityDate } = data;

                setVehicleUnavailableDates(convertDates(unAvailabilityDate));

                const minMaxDays = vehicleBusinessConstraints
                    ? vehicleBusinessConstraints.map((constraint: { constraintValue: any }) => {
                          const { maximumDays, minimumDays } = JSON.parse(constraint.constraintValue);
                          return { maximumDays, minimumDays };
                      })
                    : [];

                const firstMinMax = minMaxDays.length > 0 ? minMaxDays[0] : {};

                setMinDays(firstMinMax?.maximumDays || 0);
                setMaxDays(firstMinMax?.minimumDays || 0);
            } catch (error) {
                console.error('Error fetching Availability dates', error);
                setError('Error fetching Availability dates');
            }
        };

        fetchData();

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleDateSelect = newDate => {
        let newError = '';
        setDate(newDate);

        if (newDate?.from) {
            if (!newDate.to) {
                // Handle case when only 'from' date is selected
                newError = 'Please pick an End day.';
                setErrorDates();
            } else {
                const fromDate = newDate.from.toISOString() || '';
                const toDate = newDate.to.toISOString() || '';

                if (isDateRangeUnavailable(fromDate, toDate, vehicleUnavailableDates)) {
                    newError = 'Selected date range overlaps with unavailable dates.';
                    setErrorDates();
                } else if (!isValidDateRange(fromDate, toDate, minDays, maxDays)) {
                    newError = `Selected date range must be between ${minDays} and ${maxDays} days.`;
                    setErrorDates();
                } else {
                    setNewDate(newDate.from, newDate.to);
                }
            }
        } else {
            newError = 'Please pick a Start day.';
            setErrorDates();
        }

        setError(newError);
        setParentError(newError);
    };

    const setNewDate = (from, to) => {
        setPickupDate(from);
        setDropDate(to);
    };

    const setErrorDates = () => {
        setPickupDate(null);
        setDropDate(null);
    };

    return (
        <Dialog>
            <DialogTrigger>
                <div className='w-full items-center  whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-transparent shadow-sm  hover:text-accent-foreground h-9 px-4 py-2 flex justify-between'>
                    <div className='inline-flex'>
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {error ? (
                            <span className='text-red-500'>{error}</span>
                        ) : (
                            <span>
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(date.from, 'LLL dd, y')
                                    )
                                ) : (
                                    <span>{format(preDate, 'LLL dd, y')} </span>
                                )}
                            </span>
                        )}
                    </div>
                    <FaChevronRight className='text-neutral-500  rotate-90' />
                </div>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[800px] sm:max-h-[800px]'>
                <DialogHeader>
                    <DialogTitle>Vehicle Availability Calendar</DialogTitle>
                    <DialogDescription>
                        {error ? (
                            <span className='text-red-500'>{error}</span>
                        ) : (
                            <span>
                                Selected Trip Dates:{' '}
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(date.from, 'LLL dd, y')
                                    )
                                ) : (
                                    <span>{format(preDate, 'LLL dd, y')} </span>
                                )}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className='flex justify-center w-full'>
                    <Calendar

                        initialFocus
                        mode='range'
                        defaultMonth={today}
                        selected={date}
                        onSelect={handleDateSelect}
                        numberOfMonths={isMobile ? 1 : 3}
                        disabled={date => {
                            const yesterdate = new Date();
                            yesterdate.setDate(yesterdate.getDate() - 1);
                            return vehicleUnavailableDates.includes(date.toISOString().split('T')[0]) || date < yesterdate;
                        }}
                    />
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type='button' className={`bg-primary ${error ? 'cursor-not-allowed opacity-50' : ''}`} disabled={!!error}>
                            Save and continue
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function convertDates(unAvailabilityDate: string[]): string[] {
    const result: string[] = [];

    for (const dateStr of unAvailabilityDate) {
        const currentDate = new Date(dateStr);
        currentDate.setDate(currentDate.getDate()); // Subtract one day

        const formattedDate = currentDate.toISOString().split('T')[0];
        result.push(formattedDate);
    }

    return result;
}

function isDateRangeUnavailable(from: string, to: string, unavailableDates: string[]): boolean {
    const startDate = new Date(from);
    const endDate = new Date(to);

    for (const unavailableDateStr of unavailableDates) {
        const unavailableDate = new Date(unavailableDateStr);
        if (startDate <= unavailableDate && unavailableDate <= endDate) {
            return true;
        }
    }
    return false;
}

function isValidDateRange(fromDate, toDate, minDays, maxDays) {
    if (minDays === 0 || maxDays === 0) {
        return true;
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysDifference >= minDays && daysDifference <= maxDays;
}
