// Assuming 'use server' is a valid directive in your project environment
'use server';

export const getStateByCountry = async () => {

    const url = `https://api.countrystatecity.in/v1/countries/US/states`;
    console.log(url)

    const headersList = {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'X-CSCAPI-KEY': 'aDE3ZUMxSVc3WmhVNG1yV0tWSmZ3RmVaa1dhUFhjSFRielhzYnZQMQ==',
    };

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headersList,
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        return data;
    } catch (error) {
        console.error('Error Creating new user:', error);
        throw new Error('Error Creating new user');
    }
};
