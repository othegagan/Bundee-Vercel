"use server"


export const sendMessageToHost = async (tripId: string, messageBody:any, firebase_token: string) => {

    const baseURL = process.env.CHAT_SERVICE_BASEURL;

    const url = baseURL + '/clientSendMessage';

    const headersList = {
        Accept: '*/*',
        'Authorization': `Bearer ${firebase_token}`,
        'Content-Type': 'application/json',
    };

    const body = {
        tripId: tripId,
        message: messageBody
    };

    console.log(JSON.stringify(body));
    console.log('Authorization ' + firebase_token);

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


        const res_client = {
            success : true
        }

        return res_client;


    } catch (error) {
        console.error('Error Generating the chat History', error);
        throw error; // Propagate the original error
    }
};
