import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { countries } from '@/constants';
import { cn } from '@/lib/utils';
import { AsYouType, type CountryCode } from 'libphonenumber-js';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useStateHistory } from './use-state-history';

interface PhoneInputProps extends React.ComponentPropsWithoutRef<'input'> {
    value?: string;
    defaultCountry?: CountryCode;
    onRawValueChange?: (rawValue: string) => void;
}

export default function PhoneInput({ value: valueProp, defaultCountry = 'US', className, id, required = true, onRawValueChange, ...rest }: PhoneInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [value, handlers, history] = useStateHistory(valueProp);
    const [formattedValue, setFormattedValue] = React.useState('');

    // Set initial country code and phone numbeReact.r length limit
    const [countryCode, setCountryCode] = React.useState<CountryCode>(defaultCountry);
    const selectedCountry = countries.find((country) => country.code === countryCode);

    // Max length for phone number input based on selected country
    const phoneMaxLength = selectedCountry?.phoneLength || 10;

    const [openCommand, setOpenCommand] = React.useState(false);

    React.useEffect(() => {
        // Format the value for display whenever the value or country code changes
        const formatter = new AsYouType(countryCode);
        const formatted = formatter.input(`+${selectedCountry?.phone}${value}`);
        setFormattedValue(formatted);
    }, [value, countryCode, selectedCountry]);

    const handleOnInput = (event: React.FormEvent<HTMLInputElement>) => {
        const inputValue = event.currentTarget.value;

        // Remove the country code and all non-digit characters
        const digitsOnly = inputValue.replace(new RegExp(`^\\+${selectedCountry?.phone}`), '').replace(/\D/g, '');

        // Limit phone number input based on the country's allowed max length
        let limitedInput = digitsOnly;
        if (typeof phoneMaxLength === 'number') {
            limitedInput = digitsOnly.substring(0, phoneMaxLength);
        } else if (Array.isArray(phoneMaxLength)) {
            limitedInput = digitsOnly.substring(0, Math.max(...phoneMaxLength));
        }

        handlers.set(limitedInput);
        if (onRawValueChange) {
            onRawValueChange(`+${selectedCountry?.phone}${limitedInput}`);
        }
    };

    const handleOnPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();

        const clipboardData = event.clipboardData;
        if (clipboardData) {
            let pastedData = clipboardData.getData('text/plain');

            // Remove the country code and all non-digit characters
            pastedData = pastedData.replace(new RegExp(`^\\+${selectedCountry?.phone}`), '').replace(/\D/g, '');

            // Limit phone number input based on the country's allowed max length
            if (typeof phoneMaxLength === 'number') {
                pastedData = pastedData.substring(0, phoneMaxLength);
            } else if (Array.isArray(phoneMaxLength)) {
                pastedData = pastedData.substring(0, Math.max(...phoneMaxLength));
            }

            handlers.set(pastedData);
            if (onRawValueChange) {
                onRawValueChange(`+${selectedCountry?.phone}${pastedData}`);
            }
        }
    };

    return (
        <div className={cn('flex gap-2', className)}>
            <Popover open={openCommand} onOpenChange={setOpenCommand} modal={true}>
                <PopoverTrigger asChild>
                    <Button variant='outline' aria-expanded={openCommand} className='w-max items-center justify-between whitespace-nowrap'>
                        {selectedCountry?.image ? (
                            <div className=' h-5 w-7 overflow-hidden rounded'>
                                <img
                                    src={selectedCountry.image}
                                    className='h-full w-full object-cover object-center'
                                    aria-labelledby={selectedCountry.label}
                                    title={selectedCountry.label}
                                    alt={selectedCountry.label}
                                />
                            </div>
                        ) : (
                            'Select country'
                        )}
                        <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-max p-0' align='start'>
                    <Command>
                        <CommandInput placeholder='Search country...' />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <ScrollArea className='max-h-[200px] max-w-[500px] overflow-y-auto'>
                                <CommandGroup>
                                    {countries.map((country) => {
                                        return (
                                            <CommandItem
                                                key={country.code}
                                                value={`${country.label} (+${country.phone})`}
                                                onSelect={() => {
                                                    setCountryCode(country.code as CountryCode);
                                                    setOpenCommand(false);
                                                }}>
                                                <Check className={cn('mr-2 size-4', countryCode === country.code ? 'opacity-100' : 'opacity-0')} />
                                                {country.image ? (
                                                    <div className='mr-3 h-4 w-7 overflow-hidden rounded'>
                                                        <img
                                                            src={country.image}
                                                            className='h-full w-full object-cover object-center'
                                                            aria-labelledby={country.label}
                                                            title={country.label}
                                                            alt={country.label}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='h-3 w-4 bg-muted' />
                                                )}
                                                <span className='max-w-[200px] truncate'>{country.label}</span>
                                                <span className='ml-1 text-gray-11'>(+{country.phone})</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Phone input field including non-editable country code */}

            <Input
                ref={inputRef}
                type='tel'
                name='phone'
                id={id}
                value={formattedValue}
                onInput={handleOnInput}
                onPaste={handleOnPaste}
                required={required}
                aria-required={required}
                {...rest}
            />
        </div>
    );
}
