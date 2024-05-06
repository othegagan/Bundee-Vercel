'use server';

export async function retrieveAndSendData() {
    return fetch('https://bundee-webdriver-qa.vercel.app/api/test', {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    })
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            // Handle any errors that occur during the API call
        });
}
