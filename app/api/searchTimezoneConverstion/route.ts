//API  route to convert dates for search API

import { convertToCarTimeZoneISO, getSearchDates } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { latitude, longitude, zipCode, startDate, startTime, endDate, endTime } = await req.json();
        let zoneStartDateTime = '';
        let zoneEndDateTime = '';

        if (zipCode == '') {
            zoneStartDateTime = getSearchDates(Number(longitude), Number(latitude), startDate, startTime);
            zoneEndDateTime = getSearchDates(Number(longitude), Number(latitude), endDate, endTime);
        } else {
            zoneStartDateTime = convertToCarTimeZoneISO(startDate, startTime, zipCode);
            zoneEndDateTime = convertToCarTimeZoneISO(endDate, endTime, zipCode);
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
