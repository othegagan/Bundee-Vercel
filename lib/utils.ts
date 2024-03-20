import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

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


export function createDateTime(dateString, timeString) {
    const date = new Date(dateString);
    const [hour, minute, period] = timeString.match(/\d+|\w+/g);

    const hour24 = period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : parseInt(hour);

    date.setHours(hour24, parseInt(minute), 0, 0);
    return date;
}

export function extractTimeIn12HourFormat(timeString) {
    // Remove the '+00' from the time string
    const cleanedTimeString = timeString.replace('+00', '');

    const date = new Date(cleanedTimeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    return formattedTime;
}

export function convertToAPITimeFormat(dateTimeString) {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.slice(0, 5).split(':');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}


export function formatDate(date) {
    return `${format(new Date(date), 'PPP')} | ${format(new Date(date), 'h:mm a')}`;
}
