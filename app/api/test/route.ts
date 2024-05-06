import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const delayPromise = new Promise(resolve => {
        setTimeout(() => {
            resolve('Promise resolved after 14 seconds');
            const response = NextResponse.json(
                {
                    success: true,
                    message: 'Successfully converted to vehicle specified time zone',
                },
                { status: 200 },
            );
            response.headers.set('Access-Control-Allow-Origin', '*'); // Adding CORS header
            return response;
        }, 14000);
    });

    return await delayPromise;
}
