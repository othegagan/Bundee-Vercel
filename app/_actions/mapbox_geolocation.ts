'use server';

export const fetchDataFromMapboxWithForwardGeocoding = async searchQuery => {
    const searchCountry = process.env.MAPBOX_SEARCH_COUNTRY;
    const searchLimit = process.env.MAPBOX_SEARCH_LIMIT;
    const responseLanguage = process.env.MAPBOX_RESPONSE_LANGUAGE;
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    const baseURL = process.env.MAPBOX_BASE_URL;

    const url = `${baseURL}${searchQuery}.json?country=${searchCountry}&limit=${searchLimit}&proximity=ip&types=place%2Cpostcode%2Caddress%2Cpoi%2Cdistrict%2Clocality%2Cneighborhood&language=${responseLanguage}&access_token=${accessToken}`;

    try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const forwardGeoCodingLocationData = data['features'];

        const suggestions = extractDataFromJsonAndStoreIntoController(forwardGeoCodingLocationData);
        return suggestions;
    } catch (error) {
        console.error('Error fetching data from Mapbox:', error);
        throw new Error('An error occurred while fetching data.');
    }
};

const extractDataFromJsonAndStoreIntoController = (data: any) => {
    const locationSuggestionsFromMapBox = [];

    for (const item of data) {
        const textEn = item['text_en'];
        const placeName = item['place_name'];
        const latitude = item['center'][0];
        const longitude = item['center'][1];

        // Check if the location is an airport
        const isAirport = item['properties'] && item['properties']['category'] === 'airport';

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
