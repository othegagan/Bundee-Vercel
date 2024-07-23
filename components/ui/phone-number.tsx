'use client';

import React from 'react';
import PhoneInput from 'react-phone-input-2';
import './phone-number-input-style.css';

interface PhoneNumberProps {
    props?: any;
    phone: string;
    setPhone: (value: string) => void;
    className?: string;
}

export default function PhoneNumber({ phone, setPhone, className, props }: PhoneNumberProps) {
    return (
        <div className={`w-full ${className}`}>
            <PhoneInput
                specialLabel={''}
                placeholder='Ex : +1234567890'
                country={'us'}
                prefix={'+'}
                value={phone}
                onChange={(phone) => setPhone(phone)}
                countryCodeEditable={false}
                {...props}
            />
        </div>
    );
}
