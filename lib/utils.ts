import { parseZonedDateTime } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import { addMinutes, format, parse, startOfHour } from 'date-fns';
import moment from 'moment-timezone';
import { twMerge } from 'tailwind-merge';
import tzlookup from 'tz-lookup';
import zipToTimeZone from 'zipcode-to-timezone';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function JSONparsefy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

export function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function roundToTwoDecimalPlaces(num: number) {
    try {
        return Number.parseFloat(num.toString()).toFixed(2);
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

export function formatDateAndTime(date: string, zipCode: string, format = 'ddd, MMM DD YYYY | h:mm A z') {
    if (!date || !zipCode) return '';
    const endTimeUTC = moment.utc(date);
    const timeZone = getTimeZoneByZipcode(zipCode);
    const timeInTimeZone = endTimeUTC.tz(timeZone);

    return timeInTimeZone.format(format || 'ddd, MMM DD YYYY | h:mm A z');
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
    }
    console.log('Timezone not found for provided coordinates.');
    return null;
}

export function convertToCarDate(dateString: string, zipCode: string) {
    const endTimeUTC = moment.utc(dateString);
    const timeZone = getTimeZoneByZipcode(zipCode);
    const timeInTimeZone = endTimeUTC.tz(timeZone);

    const formattedDate = timeInTimeZone.format('yyyy-MM-DD');

    return `${formattedDate}`;
}

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getFullAddress({ vehicleDetails, tripDetails }: { vehicleDetails?: any; tripDetails?: any }): string {
    if (!vehicleDetails && !tripDetails) return '';

    const addressParts = [];
    if (vehicleDetails) {
        if (vehicleDetails.address1) {
            addressParts.push(toTitleCase(vehicleDetails.address1));
        }
        if (vehicleDetails.address2) {
            addressParts.push(toTitleCase(vehicleDetails.address2));
        }
        if (vehicleDetails.zipcode) {
            addressParts.push(vehicleDetails.zipcode);
        }
        if (vehicleDetails.cityname) {
            addressParts.push(toTitleCase(vehicleDetails.cityname));
        }
        if (vehicleDetails.state) {
            addressParts.push(toTitleCase(vehicleDetails.state));
        }
    } else if (tripDetails) {
        if (tripDetails.vehaddress1) {
            addressParts.push(toTitleCase(tripDetails.vehaddress1));
        }
        if (tripDetails.vehaddress2) {
            addressParts.push(toTitleCase(tripDetails.vehaddress2));
        }
        if (tripDetails.vehzipcode) {
            addressParts.push(tripDetails.vehzipcode);
        }
        if (tripDetails.vehcityname) {
            addressParts.push(toTitleCase(tripDetails.vehcityname));
        }
        if (tripDetails.vehstate) {
            addressParts.push(toTitleCase(tripDetails.vehstate));
        }
    }

    const address = addressParts.join(', ');

    return address;
}

export function sortImagesByIsPrimary(images: any[]) {
    if (!Array.isArray(images)) {
        return [];
    }

    return images.slice().sort((a, b) => {
        // Sort records with isPrimary true first
        if (a.isPrimary && !b.isPrimary) {
            return -1;
        }
        if (!a.isPrimary && b.isPrimary) {
            return 1;
        }
        // For records with the same isPrimary value, maintain their original order
        return a.orderNumber - b.orderNumber;
    });
}
