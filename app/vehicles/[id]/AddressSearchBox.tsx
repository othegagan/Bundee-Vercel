import { debounce } from '@/components/search_box/LocationSearchBox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMapboxData } from '@/hooks/useMapboxData';
import React, { useEffect, useState } from 'react';

const DEBOUNCE_TIME = 300;

const AddressSearchBox = ({ setCustomDeliveryLocation }: any) => {
    const [inputValue, setInputValue] = useState('');
    const [show, setShow] = useState(false);
    const [blurTimeoutId, setBlurTimeoutId] = useState<any>(null);

    const { data: locationSuggestions, loading, error, fetchData } = useMapboxData();

    const debounceFetchData = debounce(fetchData, DEBOUNCE_TIME);

    const handleInputChange = (e: { target: { value: any } }) => {
        const value = e.target.value;
        setInputValue(value);
        setCustomDeliveryLocation(value);
        debounceFetchData(value);
    };

    return (
        <div className='relative '>
            <Input
                type='text'
                className=' pr-4 font-normal text-foreground placeholder:text-muted-foreground/80'
                value={inputValue}
                onChange={handleInputChange}
                placeholder='Enter Delivery Location'
                onClick={(e) => {
                    const inputElement = e.target as HTMLInputElement;
                    inputElement.select();
                    setShow(true);
                    document.body.style.overflow = 'hidden';
                }}
                onBlur={() => {
                    const timeoutId = setTimeout(() => setShow(false), 200);
                    setBlurTimeoutId(timeoutId);
                    document.body.style.overflow = 'unset';
                }}
                aria-haspopup='listbox'
            />

            <div
                className={`absolute  z-10 mt-1 max-h-56 w-full overflow-auto rounded-md  border-t  bg-white p-1 px-2 py-1.5 text-xs font-medium  text-foreground shadow-lg transition-opacity ease-in-out ${
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
                            }}>
                            <span>{item.placeName}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddressSearchBox;
