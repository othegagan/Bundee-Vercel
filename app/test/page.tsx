import { convertToCarTimeZoneISO, formatDateAndTime, getTimeZoneByZipcode } from '@/lib/utils';
import React from 'react';

export default function page() {
    const date = '2024-04-30';
    const time = '18:30:00';
    const zipCode = '85323';

    const timeZone = getTimeZoneByZipcode(zipCode);

    const startDate = convertToCarTimeZoneISO(date, time, zipCode);

    console.log(startDate);

    return <div>{formatDateAndTime(startDate, zipCode)}</div>;
}
