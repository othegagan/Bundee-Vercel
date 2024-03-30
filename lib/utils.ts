import { parseZonedDateTime } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import { format, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import zipToTimeZone from 'zipcode-to-timezone';
import moment from 'moment-timezone';

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

export function getTimeZoneByZipcode(zipCode: string) {
    const timeZone = zipToTimeZone.lookup(zipCode) || 'America/Chicago'; // 73301, (Los angeles zip code : 90274) (MST : 85323)
    // console.log('Time zone:', timeZone);
    return timeZone || null;
}

export function convertToCarTimeZoneISO(date: string, time: string, zipCode: string) {
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