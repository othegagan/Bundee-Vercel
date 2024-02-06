
"use server"

export const getTripChatHistory = async (tripId: string, firebase_token: string) => {

    const BaseURL = process.env.CHAT_SERVICE_BASEURL;

    const url = BaseURL + '/getAllChatHistory';


    const headersList = {
        Accept: '*/*',
        'Authorization': `Bearer ${firebase_token}`,
        'Content-Type': 'application/json',
    };

    const body = {
        tripId: tripId,
        count: 1000
    };

    // console.log(JSON.stringify(body));
    // console.log('Authorization ' + firebase_token);

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

        const messageData = data.messages.map(item => ({
            author: item.author,
            message: item.body,
            deliveryDate: item.dateUpdated // Adjust as needed
        }));

        return messageData;

    } catch (error) {
        console.error('Error Generating the chat History', error);
        throw error; // Propagate the original error
    }
};
