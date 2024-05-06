'use server';

export async function retrieveAndSendData() {
    return fetch('https://bundee-webdriver-qa.vercel.app/api/test', {
        method: 'POST',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            latitude: '',
            longitude: '',
            startDate: '2024-04-09',
            startTime: '10:00:00',
            endDate: '2024-04-11',
            endTime: '10:00:00',
            zipCode: '73301',
        }),
    })
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            // Handle any errors that occur during the API call
        });
}
