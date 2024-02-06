
"use server"

export const initializeAuthTokens = async () => {

    const url = process.env.BUNDEE_TOKEN_INITILIZE_URL;
    // console.log(url);
    const headersList = {
        'bundee_auth_token': process.env.INITIAL_TOKEN_DUMMY, // Use correct header format
    };
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headersList,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    


        const data = await response.json();
     

        return data; 

        

    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('An error occurred while fetching data.');
    }
};
