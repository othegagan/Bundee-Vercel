import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapboxData } from '@/hooks/useMapboxData';
import { fetchDataFromMapboxWithForwardGeocoding } from '@/server/mapbox';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useQueryState } from 'next-usequerystate';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';

const DEBOUNCE_TIME = 300;

const LocationSearchBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [show, setShow] = useState(false);
    const [blurTimeoutId, setBlurTimeoutId] = useState<any>(null);

    const { data: locationSuggestions, loading, error, fetchData } = useMapboxData();
    const searchParams = useSearchParams();

    const [city, setCity] = useQueryState('city', { defaultValue: 'Austin, Texas, United States' });
    const [latitude, settLatitude] = useQueryState('latitude', { defaultValue: '-97.7437', history: 'replace' });
    const [longitude, setLongitude] = useQueryState('longitude', { defaultValue: '30.271129', history: 'replace' });
    const [isAirport, setIsAirport] = useQueryState('isAirport', { defaultValue: 'false', history: 'replace' });
    const [isMapSearch, setIsMapSearch] = useQueryState('isMapSearch', { defaultValue: 'false', history: 'replace' });
    const [zoomLevel, setzoomLevel] = useQueryState('zoomLevel', { defaultValue: '12', history: 'replace' });

    useEffect(() => {
        const city = searchParams.get('city') || '';
        setInputValue(city);
        fetchData(city);
    }, [searchParams]);

    const debounceFetchData = debounce(fetchData, DEBOUNCE_TIME);

    const handleInputChange = (e: { target: { value: any } }) => {
        const value = e.target.value;
        setInputValue(value);
        debounceFetchData(value);
    };

    useEffect(() => {
        if (show) {
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = '';
        }
    }, [show]);

    return (
        <div>
            <div className='relative '>
                <div className='relative'>
                    <MagnifyingGlassIcon className='pointer-events-none absolute left-2 top-2 h-5 w-5 text-neutral-400' aria-hidden='true' />
                    <Input
                        type='text'
                        className='pl-9 pr-4 font-normal text-foreground placeholder:text-muted-foreground/80'
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder='Austin, Texas'
                        onClick={(e) => {
                            const inputElement = e.target as HTMLInputElement;
                            inputElement.select();
                            setShow(true);
                        }}
                        onBlur={() => {
                            const timeoutId = setTimeout(() => setShow(false), 200);
                            setBlurTimeoutId(timeoutId);
                        }}
                        aria-haspopup='listbox'
                    />
                </div>

                <div
                    className={`'z-[997] absolute mt-1 min-w-[300px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${
                        show && inputValue ? 'scale-1  opacity-100' : 'scale-0  opacity-0'
                    }`}
                    role='presentation'>
                    <p className='mb-1 text-[11px] text-neutral-400'>Suggestions</p>

                    {loading ? (
                        <div className='flex w-[300px] flex-col gap-2 px-2'>
                            <Skeleton className='h-4 w-3/4 rounded-md bg-neutral-300' />
                            <Skeleton className='h-4 w-1/2 rounded-md bg-neutral-300' />
                        </div>
                    ) : (
                        <>
                            {error && <p className='my-6 w-[300px] text-center text-xs'>{error}</p>}
                            {!error && locationSuggestions.length === 0 ? (
                                <div className='flex w-[300px] flex-col gap-2'>
                                    <p className='my-6 text-center text-xs'>No Suggestions</p>
                                </div>
                            ) : (
                                <ScrollArea className='border-1 flex max-h-60 w-full select-none flex-col rounded-lg p-1'>
                                    {locationSuggestions.map((item: any, index: number) => (
                                        <div
                                            className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-[13px] outline-none hover:bg-neutral-200 hover:text-accent-foreground '
                                            key={index}
                                            onMouseDown={() => {
                                                setShow(false);
                                                setInputValue(item.placeName);
                                                clearTimeout(blurTimeoutId);
                                                setCity(item.placeName);
                                                settLatitude(item.latitude);
                                                setLongitude(item.longitude);
                                                setIsAirport(item.isAirport);
                                                setIsMapSearch('false');
                                                setzoomLevel('10');
                                            }}>
                                            <span>{item.placeName}</span>
                                        </div>
                                    ))}
                                </ScrollArea>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Debounce function
export const debounce = (func: any, delay: number) => {
    let timeoutId: any;
    return (...args: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

export default LocationSearchBox;
