import { convertToCarTimeZoneISO, formatDateAndTime } from '@/lib/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { from, zipCodeArr, startimeArr, endtimeArr } = await req.json();

        // Validate the request payload
        if (
            (from !== 'USER' && from !== 'DB') ||
            !Array.isArray(zipCodeArr) ||
            zipCodeArr.length === 0 ||
            !Array.isArray(startimeArr) ||
            startimeArr.length === 0 ||
            !Array.isArray(endtimeArr) ||
            endtimeArr.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid request',
                    data: null
                },
                { status: 400 }
            );
        }

        const formattedStarttimeArr = [];
        const formattedEndtimeArr = [];

        if (from === 'USER') {
            for (let i = 0; i < startimeArr.length; i++) {
                const formattedDate = convertToCarTimeZoneISO(startimeArr[i], zipCodeArr[i]);
                formattedStarttimeArr.push(formattedDate);
            }

            for (let i = 0; i < endtimeArr.length; i++) {
                const formattedDate = convertToCarTimeZoneISO(endtimeArr[i], zipCodeArr[i]);
                formattedEndtimeArr.push(formattedDate);
            }
        } else {
            for (let i = 0; i < startimeArr.length; i++) {
                const formattedDate = formatDateAndTime(startimeArr[i], zipCodeArr[i], 'ddd, MMM DD YYYY | h:mm A z');
                formattedStarttimeArr.push(formattedDate);
            }

            for (let i = 0; i < endtimeArr.length; i++) {
                const formattedDate = formatDateAndTime(endtimeArr[i], zipCodeArr[i], 'ddd, MMM DD YYYY | h:mm A z');
                formattedEndtimeArr.push(formattedDate);
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully converted to vehicle specified time zone',
                data: {
                    startTime: formattedStarttimeArr,
                    endTime: formattedEndtimeArr
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: `Failed to convert the dates: ${error.message}`,
                data: null
            },
            { status: 500 }
        );
    }
}
