import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    const delayPromise = new Promise<Response>(resolve => {
        setTimeout(() => {
            resolve(NextResponse.json(
                {
                    success: true,
                    message: 'Successfully converted to vehicle specified time zone',
                },
                { status: 200 },
            ));
        }, 14000);
    });

    return await delayPromise;
}
