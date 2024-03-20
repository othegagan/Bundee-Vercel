import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { useQueryState } from 'next-usequerystate';
import { fetchDataFromMapboxWithForwardGeocoding } from '@/server/mapbox';
import { useMapboxData } from '@/hooks/useMapboxData';

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

    useEffect(() => {
        const city = searchParams.get('city') || '';
        setInputValue(city);
        fetchData(city);
    }, []);

    const debounceFetchData = debounce(fetchData, DEBOUNCE_TIME);

    const handleInputChange = (e: { target: { value: any } }) => {
        const value = e.target.value;
        setInputValue(value);
        debounceFetchData(value);
    };

    return (
        <div>
            <div className='relative '>
                <div className='relative'>
                    <MagnifyingGlassIcon className='pointer-events-none absolute left-2 top-2 h-5 w-5 text-neutral-400' aria-hidden='true' />
                    <Input
                        type='text'
                        className={`pl-9 pr-4 font-normal text-foreground placeholder:text-muted-foreground/80`}
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder='Austin, Texas'
                        onClick={e => {
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
                    className={`absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md  border-t  bg-white p-1 px-2 py-1.5 text-xs font-medium  text-foreground shadow-lg transition-opacity ease-in-out ${
                        show && inputValue ? 'scale-1  opacity-100' : 'scale-0  opacity-0'
                    }`}
                    role='presentation'>
                    <p className='mb-1 text-[11px] text-neutral-400'>Suggestions</p>

                    {loading && (
                        <div className='flex flex-col gap-2'>
                            <Skeleton className='h-4 w-3/4 rounded-md bg-neutral-300' />
                            <Skeleton className='h-4 w-1/2 rounded-md bg-neutral-300' />
                        </div>
                    )}

                    {error && <p className='my-3 text-center text-xs'>{error}</p>}

                    <div role='group'>
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
                                }}>
                                <span>{item.placeName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Debounce function
export const debounce = (func: Function, delay: number) => {
    let timeoutId: any;
    return (...args: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

export default LocationSearchBox;
