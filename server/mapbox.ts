'use server';

export async function fetchDataFromMapboxWithForwardGeocoding(searchQuery: string, addressSeach?: boolean) {
    try {
        const searchCountry = process.env.MAPBOX_SEARCH_COUNTRY;
        const searchLimit = process.env.MAPBOX_SEARCH_LIMIT;
        const responseLanguage = process.env.MAPBOX_RESPONSE_LANGUAGE;
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        const baseURL = process.env.MAPBOX_BASE_URL;

        let url = '';

        url = addressSeach
            ? `${baseURL}${searchQuery}.json?country=${searchCountry}&limit=${searchLimit}&proximity=ip&types=address&language=${responseLanguage}&access_token=${accessToken}`
            : `${baseURL}${searchQuery}.json?country=${searchCountry}&limit=${searchLimit}&proximity=ip&types=place%2Cpostcode%2Caddress%2Cpoi%2Cdistrict%2Clocality%2Cneighborhood&language=${responseLanguage}&access_token=${accessToken}`;

        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const forwardGeoCodingLocationData = data.features;

        const suggestions = addressSeach ? extractAddressFromJson(forwardGeoCodingLocationData) : extractDataFromJson(forwardGeoCodingLocationData);
        return suggestions;
    } catch (error: any) {
        console.error('Error fetching data from Mapbox:', error);
        throw new Error('Error fetching data from Mapbox:');
    }
}

const extractDataFromJson = (data: any) => {
    const locationSuggestionsFromMapBox = [];

    for (const item of data) {
        const textEn = item.text_en;
        const placeName = item.place_name;
        const latitude = item.center[0];
        const longitude = item.center[1];

        // Check if the location is an airport
        const isAirport = item.properties && item.properties.category === 'airport';

        const locationSuggestion = {
            textEn,
            placeName,
            latitude,
            longitude,
            isAirport,
        };

        locationSuggestionsFromMapBox.push(locationSuggestion);
    }

    return locationSuggestionsFromMapBox;
};

const extractAddressFromJson = (data: any) => {
    const addressSuggestionsFromMapBox = [];

    for (const item of data) {
        const placeName = item.place_name;
        const components = placeName.split(',');

        const address1 = components[0].trim();
        const city = components[1].trim();
        const stateZip = components[2].trim().split(' ');
        const state = stateZip[0].trim();
        const zipcode = stateZip[1].trim();

        const locationSuggestion = {
            placeName,
            address1,
            city,
            state,
            zipcode,
        };
        addressSuggestionsFromMapBox.push(locationSuggestion);
    }

    return addressSuggestionsFromMapBox;
};
