//API  route to convert dates for search API

import { getSearchDates } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
    try {
        const { latitude, longitude, startDate, startTime, endDate, endTime } = await req.json();

        const zoneStartDateTime = getSearchDates(Number(longitude), Number(latitude), startDate, startTime);
        const zoneEndDateTime = getSearchDates(Number(longitude), Number(latitude), endDate, endTime);

        const data = {
            lat: longitude,
            lng: latitude,
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
