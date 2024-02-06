export default function createDateTime(dateString, timeString) {
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
