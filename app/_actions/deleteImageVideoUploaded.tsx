'use server';

export const deleteImageVideoUploaded = async (id: any, bundee_auth_token: string) => {


    const url = process.env.NEXT_PUBLIC_DELETE_IMAGE_VIDEO_URL;

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: bundee_auth_token,
        'Content-Type': 'application/json',
    };

    const body = {
        id: id,
    };

    console.log(JSON.stringify(body));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headersList,
            body: JSON.stringify(body),
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const res = {
            success: data.errorCode == '0' ? true : false,
        };
        return res;
    } catch (error) {
        console.error('Error deleteing image or video uploaded:', error);
        throw new Error('error deleteing image or video uploaded');
    }
};
