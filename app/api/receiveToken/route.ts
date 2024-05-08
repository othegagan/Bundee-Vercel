import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { deviceToken } = await req.json();

        console.log('deviceToken ', deviceToken);

        if (deviceToken) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Token Received',
                    data: deviceToken,
                },
                { status: 200 },
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Token not Received',
                    data: null,
                },
                { status: 500 },
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to receive token : ' + error,
                data: null,
            },
            { status: 500 },
        );
    }
}
