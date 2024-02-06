'use client';

import React, { useEffect, useState } from 'react';

import { Input } from './ui/input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { fetchDataFromMapboxWithForwardGeocoding } from '@/app/_actions/mapbox_geolocation';

export default function SearchBox({ setValue, searchObject }: { setValue: any, searchObject?: any }) {
    const [inputValue, setInputValue] = useState<string>('');
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [show, setShow] = useState(false);
    const [blurTimeoutId, setBlurTimeoutId] = useState(null);

    const searchParams = useSearchParams();

    async function fetchDataFromMapbox(query) {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchDataFromMapboxWithForwardGeocoding(query);
            setLocationSuggestions(response);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
            setError('An error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const city = searchParams.get('city') || '';
        setInputValue(city);
        fetchDataFromMapbox(city);
        setValue({
            textEn: searchObject?.city || 'Austin, Texas, United States',
            placeName: searchObject?.city || 'Austin, Texas, United States',
            latitude: searchObject?.latitude || -97.7437,
            longitude: searchObject?.longitude || 30.271129,
            isAirport : searchObject?.isAirport || false,
        });
    }, [searchObject]);

    const handleInputChange = e => {
        const value = e.target.value;
        setInputValue(value);
        fetchDataFromMapbox(value);
    };

    return (
        <>
            <div>
                <div className='relative z-50'>
                    <div className='relative'>
                        <MagnifyingGlassIcon className='pointer-events-none absolute top-2 left-2 h-5 w-5 text-neutral-400' aria-hidden='true' />
                        <Input
                            type='text'
                            className=' pl-9 pr-4 font-normal text-foreground placeholder:text-muted-foreground/80'
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
                        className={`absolute w-full z-10 mt-1 rounded-md overflow-auto max-h-56  p-1  bg-white px-2 py-1.5 text-xs font-medium text-foreground  shadow-lg border-t transition-opacity ease-in-out ${
                            show && inputValue ? 'opacity-100  scale-1' : 'opacity-0  scale-0'
                        }`}
                        role='presentation'>
                        <p className='text-[11px] mb-1 text-neutral-400'>Suggestions</p>

                        {loading && (
                            <div className='flex flex-col gap-2'>
                                <Skeleton className='w-3/4 h-4 rounded-md bg-neutral-300' />
                                <Skeleton className='w-1/2 h-4 rounded-md bg-neutral-300' />
                            </div>
                        )}

                        {error && <p className='text-xs text-center my-3'>{error}</p>}

                        <div role='group'>
                            {locationSuggestions.map((item, index) => (
                                <div
                                    className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-[13px] outline-none hover:bg-neutral-200 hover:text-accent-foreground '
                                    key={index}
                                    onMouseDown={() => {
                                        setShow(false);
                                        setInputValue(item.placeName);
                                        setValue(item);
                                        clearTimeout(blurTimeoutId);
                                    }}>
                                    <span>{item.placeName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

{
    /* <strong>{item.placeName}</strong> ({item.textEn}), Lat: {item.latitude}, Long: {item.longitude} */
}
