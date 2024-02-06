'use client';

import React, { useEffect, useState } from 'react';
import { getAllUserWishlistedVehicles } from '../_actions/get_all_wishlists';
import { removeUserWishlistVehicle } from '../_actions/unwislist';
import { getAvailabilityDatesByVehicleId } from '../_actions/get_availability_dates_by_vehicle_id';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addDays, format, set } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useRouter } from 'next/navigation';
import { VehiclesCardsSkeleton } from '@/components/skeletons/skeletons';

const Cars = () => {
    const [wishlistedVehicleDetails, setWishlistedVehicleDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [open, setOpen] = useState(false);
    const [vehicleId, setVehicleId] = useState(0);
    const [vehicleUnavailableDates, setVehicleUnavailableDates] = useState([]);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [newDate, setNewDate] = useState({
        from: undefined,
        to: undefined,
    });

    const router = useRouter();

    const today = new Date();

    const [date, setDate] = useState({
        from: undefined,
        to: undefined,
    });

    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const user = localStorage.getItem('session_user');
            setUserLoggedIn(user != null);

            if (user) {
                const id = localStorage.getItem('userId');
                const auth_token = localStorage.getItem('auth_token_login');
                if (id && auth_token) {
                    try {
                        const data = await getAllUserWishlistedVehicles(id, auth_token);
                        setWishlistedVehicleDetails(data);
                    } catch (error) {
                        console.error('Error fetching data', error);
                    }
                }
            }
            setIsLoading(false);
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };

        checkUserAndFetchData();

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const unWishListHandler = async vehicleId => {
        const id = localStorage.getItem('userId');
        const auth_token = localStorage.getItem('auth_token_login');

        if (id && auth_token) {
            try {
                const data = await removeUserWishlistVehicle(id, vehicleId, auth_token);
                if (data.code === '0') {
                    const updatedVehicles = wishlistedVehicleDetails.filter(car => car.vehicleid !== vehicleId);
                    setWishlistedVehicleDetails(updatedVehicles);
                }
            } catch (error) {
                console.error('Error removing wishlist item', error);
            }
        }
    };

    const handleAvailabilityCalender = vehicleId => {
        setVehicleId(vehicleId);
        setDate({
            from: undefined,
            to: undefined,
        });
        setError('Please pick a Start day.');

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token_login') || '';
                const data = await getAvailabilityDatesByVehicleId({ vehicleid: vehicleId }, token);
                // console.log('unAvailabilityDates', data);
                setVehicleUnavailableDates(convertDates(data.unAvailabilityDate));
            } catch (error) {
                console.error('Something went wrong while fetching availability dates', error);
                // setError('Something went wrong while fetching availability dates');
            }
        };

        fetchData();
        setOpen(true);
    };

    const handleDateSelect = newDate => {
        let newError = '';
        setDate(newDate);

        if (newDate?.from) {
            if (!newDate.to) {
                setNewDate({ from: newDate.from, to: newDate.from });
            } else if (newDate.to) {
                const fromDate = newDate.from.toISOString() || '';
                const toDate = newDate.to.toISOString() || '';
                // Check if the selected date range overlaps with unavailable dates
                if (isDateRangeUnavailable(fromDate, toDate, vehicleUnavailableDates)) {
                    newError = 'Selected date range overlaps with unavailable dates.';
                } else {
                    setNewDate({ from: newDate.from, to: newDate.to });
                }
            }
        } else {
            newError = 'Please pick a Start day.';
        }
        setError(newError);
    };

    const redirect = () => {
        const url = `/vehicles/${vehicleId}?city=&pickupDate=${newDate.from}&dropDate=${newDate.to}`;
        router.push(url);
    };

    const closeDialog = () => {
        setOpen(false);
        setDate({
            from: undefined,
            to: undefined,
        });
    };

    if (isLoading) {
        return (
            <div className='min-h-screen py-10'>
                <div className='mx-auto max-w-7xl flex-col '>
                    <VehiclesCardsSkeleton />
                </div>
            </div>
        );
    }

    return (
        <>
            <section className='min-h-screen py-10'>
                {wishlistedVehicleDetails.length > 0 ? (
                    <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8 sm:py-12 lg:py-12'>
                        <div className='flex flex-col mx-0'>
                            <h2 className='text-2xl font-bold leading-6 text-gray-900 ml-2'>WishLists</h2>
                        </div>

                        <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
                            {wishlistedVehicleDetails.map((car, index) => (
                                <div key={index}>
                                    <div className='bg-white shadow-lg rounded-md py-4 px-4 group relative cursor-pointer col-span-1'>
                                        <div onClick={() => handleAvailabilityCalender(car.vehicleid)} className='aspect-video w-full overflow-hidden rounded-md bg-neutral-200 lg:aspect-video group-hover:opacity-75 lg:h-44'>
                                            <img src={car.imageresponse[0].imagename} alt='' className='h-full w-full object-cover group-hover:scale-110 transition-all ease-in-out object-center lg:h-full lg:w-full' />
                                        </div>

                                        <div className='mt-3 flex justify-between items-center'>
                                            <div>
                                                <p className='text-sm text-neutral-900 p-0 font-bold'>{`${car.make} ${car.model} ${car.year}`}</p>

                                                <div className='flex items-center gap-2'>
                                                    {/* {car.rating != 0 && (
                                                <div className="rating">
                                                    <p className="text-xs font-medium text-neutral-900 ">
                                                        {car.rating}
                                                    </p>
                                                    <svg
                                                        className="w-4 h-4 text-yellow-300"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="currentColor"
                                                        viewBox="0 0 22 22">
                                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                                    </svg>
                                                </div>
                                            )} */}

                                                    {(car.tripCount != 0.0 || car.tripCount != 0 || car.tripCount != '0') && <p className='text-xs font-medium text-neutral-900  '>({car.tripCount} Trips)</p>}

                                                    {(car.tripCount == 0.0 || car.tripCount == 0 || car.tripCount == '0') && <span className='bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300'>New</span>}
                                                </div>
                                            </div>
                                            <div onClick={() => unWishListHandler(car.vehicleid)} className='flex'>
                                                <span className='inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium shadow-xl'>
                                                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                        <path d='M7.615 20C7.16833 20 6.78733 19.8426 6.472 19.528C6.15733 19.2133 6 18.8323 6 18.385V5.99998H5V4.99998H9V4.22998H15V4.99998H19V5.99998H18V18.385C18 18.845 17.846 19.229 17.538 19.537C17.2293 19.8456 16.845 20 16.385 20H7.615ZM17 5.99998H7V18.385C7 18.5643 7.05767 18.7116 7.173 18.827C7.28833 18.9423 7.43567 19 7.615 19H16.385C16.5383 19 16.6793 18.936 16.808 18.808C16.936 18.6793 17 18.5383 17 18.385V5.99998ZM9.808 17H10.808V7.99998H9.808V17ZM13.192 17H14.192V7.99998H13.192V17Z' fill='black' />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className='flex justify-center items-center h-screen'>
                        <h1>No wishlisted Vehicle</h1>
                    </div>
                )}
            </section>

            {open && (
                <div>
                    <div className='fixed inset-0 z-40 flex items-end bg-black bg-opacity-10 sm:items-center sm:justify-center appear-done enter-done backdrop-blur-[4px]'>
                        <div className='w-full px-6 py-4 overflow-hidden bg-white rounded-t-lg sm:rounded-lg sm:m-4 md:max-w-3xl md:p-7 appear-done enter-done' role='dialog'>
                            <div data-focus-guard={true} tabIndex={0} style={{ width: '1px', height: '0px', padding: '0px', overflow: 'hidden', position: 'fixed', top: '1px', left: '1px' }}></div>
                            <div data-focus-guard={true} tabIndex={1} style={{ width: '1px', height: '0px', padding: '0px', overflow: 'hidden', position: 'fixed', top: '1px', left: '1px' }}></div>
                            <div data-focus-lock-disabled='false'>
                                <h2>Vehicle Availability Calendar</h2>
                                <header className='flex justify-between gap-2'>
                                    <div>
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
                                                    <p>Pick a date</p>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <Button variant='ghost' className='inline-flex items-center justify-center p-2 text-neutral-600' aria-label='close' onClick={closeDialog}>
                                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20' role='img' aria-hidden='true'>
                                            <path d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' fillRule='evenodd'></path>
                                        </svg>
                                    </Button>
                                </header>
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
                                <footer className='flex items-center justify-end   '>
                                    <Button type='button' onClick={redirect} className={`bg-primary ${error ? 'cursor-not-allowed opacity-50' : ''}`} disabled={!!error}>
                                        Continue
                                    </Button>
                                </footer>
                            </div>
                            <div data-focus-guard='true' tabIndex={0} style={{ width: '1px', height: '0px', padding: '0px', overflow: 'hidden', position: 'fixed', top: '1px', left: '1px' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Cars;

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
