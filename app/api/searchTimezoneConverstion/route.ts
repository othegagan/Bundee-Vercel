import { convertToCarTimeZoneISO, formatDateAndTime, getSearchDates } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

function splitDateTime(dateTimeString: string) {
    const [datePart, timePart] = dateTimeString.split('T');
    const date = datePart;
    const time = timePart.split('.')[0]; // Removing milliseconds

    return { date, time };
}

export async function POST(req: NextRequest) {
    try {
        const { latitude, longitude, zipCode, startDate, startTime, endDate, endTime, startTS, endTS, tripST, tripET } = await req.json();

        let zoneStartDateTime = '';
        let zoneEndDateTime = '';

        if (zipCode === '') {
            zoneStartDateTime = getSearchDates(Number(longitude), Number(latitude), startDate, startTime);
            zoneEndDateTime = getSearchDates(Number(longitude), Number(latitude), endDate, endTime);
        } else {
            if (startTS || endTS) {
                const start = startTS ? splitDateTime(startTS) : { date: startDate, time: startTime };
                const end = endTS ? splitDateTime(endTS) : { date: endDate, time: endTime };
                zoneStartDateTime = convertToCarTimeZoneISO(start.date, start.time, zipCode);
                zoneEndDateTime = convertToCarTimeZoneISO(end.date, end.time, zipCode);
            } else if (tripST || tripET) {
                zoneStartDateTime = formatDateAndTime(tripST, zipCode);
                zoneEndDateTime = formatDateAndTime(tripET, zipCode);
            } else {
                zoneStartDateTime = convertToCarTimeZoneISO(startDate, startTime, zipCode);
                zoneEndDateTime = convertToCarTimeZoneISO(endDate, endTime, zipCode);
            }
        }

        const data = {
            lat: longitude || '',
            lng: latitude || '',
            zipCode: zipCode || '',
            startTs: zoneStartDateTime,
            endTS: zoneEndDateTime,
            pickupTime: startTime,
            dropTime: endTime,
        };

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully converted to vehicle specified time zone',
                data,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to convert the dates : ' + error,
                data: null,
            },
            { status: 500 },
        );
    }
}
