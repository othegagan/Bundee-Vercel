import { convertToCarTimeZoneISO, getSearchDates } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

function splitDateTime(dateTimeString: string) {
    const [datePart, timePart] = dateTimeString.split('T');
    const date = datePart;
    const time = timePart.split('.')[0]; // Removing milliseconds

    return { date, time };
}

export async function POST(req: NextRequest) {
    try {
        const { latitude, longitude, zipCode, startDate, startTime, endDate, endTime, startTS, endTS } = await req.json();

        let zoneStartDateTime = '';
        let zoneEndDateTime = '';

        if (zipCode === '') {
            zoneStartDateTime = getSearchDates(Number(longitude), Number(latitude), startDate, startTime);
            zoneEndDateTime = getSearchDates(Number(longitude), Number(latitude), endDate, endTime);
        } else {
            if (!startTS || !endTS) {
                zoneStartDateTime = convertToCarTimeZoneISO(startDate, startTime, zipCode);
                zoneEndDateTime = convertToCarTimeZoneISO(endDate, endTime, zipCode);
            } else {
                const start = startTS ? splitDateTime(startTS) : { date: startDate, time: startTime };
                const end = endTS ? splitDateTime(endTS) : { date: endDate, time: endTime };

                console.log(start, end);
                zoneStartDateTime = convertToCarTimeZoneISO(start.date, start.time, zipCode);
                zoneEndDateTime = convertToCarTimeZoneISO(end.date, end.time, zipCode);
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
                message: 'Failed to convert the dates',
                data: null,
            },
            { status: 500 },
        );
    }
}
