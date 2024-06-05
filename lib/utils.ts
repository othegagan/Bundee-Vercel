'use client';
import { parseZonedDateTime } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import { addMinutes, format, parse, parseISO, startOfHour } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import zipToTimeZone from 'zipcode-to-timezone';
import moment from 'moment-timezone';
import tzlookup from 'tz-lookup';
import CryptoJS from 'crypto-js';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export function roundToTwoDecimalPlaces(num: number) {
    try {
        return parseFloat(num.toString()).toFixed(2);
    } catch (error) {
        return 0;
    }
}

export function getCurrentTimeRounded() {
    const now = new Date();
    const nextHour = addMinutes(startOfHour(now), 60 * 3);
    const roundedTime = format(nextHour, 'HH:mm:ss');
    return roundedTime;
}

export function getCurrentDatePlusHours(hours: number) {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now;
}

export function getTimeZoneByZipcode(zipCode: string) {
    const timeZone = zipToTimeZone.lookup(zipCode); // 73301, (Los angeles zip code : 90274) (MST : 85323)
    // console.log('Time zone:', timeZone);
    return timeZone || null;
}

export function convertToTuroDate(dateString: string, zipCode: string) {
    const dateStringWithoutTimeZone = dateString.replace(/ [A-Z]{3} /, ' ');
    const parsedDate = parse(dateStringWithoutTimeZone, 'EEE MMM dd HH:mm:ss yyyy', new Date());
    const formattedDate = format(parsedDate, 'yyyy-MM-dd');
    const formattedTime = parsedDate.toTimeString().slice(0, 8);
    const timeZone = getTimeZoneByZipcode(zipCode);
    const combinedDateTimeString = `${formattedDate}T${formattedTime}`;
    const convertedCarDate = parseZonedDateTime(`${combinedDateTimeString}[${timeZone}]`).toAbsoluteString();
    console.log(dateString, '==>', convertedCarDate);
    return convertedCarDate;
}

export function convertToCarTimeZoneISO(date?: string, time?: string, zipCode?: string, datetime?: string) {
    // console.log(date, time, zipCode);
    if (datetime) {
        const timeZone = getTimeZoneByZipcode(zipCode);
        const converedCarDate = parseZonedDateTime(`${datetime}[${timeZone}]`).toAbsoluteString();

        return converedCarDate;
    }
    const dateString = `${date}T${time}`;
    const timeZone = getTimeZoneByZipcode(zipCode);
    const converedCarDate = parseZonedDateTime(`${dateString}[${timeZone}]`).toAbsoluteString();

    return converedCarDate;
}

export function formatDateAndTime(date: string, zipCode: string) {
    const endTimeUTC = moment.utc(date);
    const timeZone = getTimeZoneByZipcode(zipCode);
    const timeInTimeZone = endTimeUTC.tz(timeZone);

    const formattedDate = timeInTimeZone.format('MMM DD, YYYY');
    const formattedTime = timeInTimeZone.format('h:mm A');
    const timeZoneAbbreviation = timeInTimeZone.format('z');

    return `${formattedDate} | ${formattedTime} ${timeZoneAbbreviation}`;
}

export function formatTime(dateTimeString: string, zipCode: string) {
    const timeZone = getTimeZoneByZipcode(zipCode);
    const time = moment(dateTimeString).tz(timeZone).format('HH:mm:ss');
    return time;
}

export function getSearchDates(lat: number, lon: number, date: string, time: string) {
    const timezone = tzlookup(lat, lon);
    if (timezone) {
        const dateString = `${date}T${time}`;

        const converedCarDate = parseZonedDateTime(`${dateString}[${timezone}]`).toAbsoluteString();

        return converedCarDate;
    } else {
        console.log('Timezone not found for provided coordinates.');
        return null;
    }
}

export const encryptId = (id: string) => {
    const encryptionKey = 'jumv7p7DQJdX1EAS';
    return CryptoJS.AES.encrypt(id.toString(), encryptionKey).toString();
};

// Function to decrypt the ID
export const decryptId = (encryptedId: string) => {
    try {
        const encryptionKey = 'jumv7p7DQJdX1EAS';
        const decodedEncryptedId = decodeURIComponent(encryptedId);
        const bytes = CryptoJS.AES.decrypt(decodedEncryptedId, encryptionKey);
        const decryptedId = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedId;
    } catch (error) {
        console.error('Decryption error:', error);
        return ''; // Return empty string or handle error accordingly
    }
};

export function convertToCarDate(dateString: string, zipCode: string) {
    const endTimeUTC = moment.utc(dateString);
    const timeZone = getTimeZoneByZipcode(zipCode);
    const timeInTimeZone = endTimeUTC.tz(timeZone);

    const formattedDate = timeInTimeZone.format('yyyy-MM-DD');

    return `${formattedDate}`;
}
