'use server';

export const calculatePrice = async (body: any, bundee_auth_token: string) => {
    const BaseURL = process.env.HOST_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/vehicle/calculatePrice';

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: bundee_auth_token,
        'Content-Type': 'application/json',
    };

    try {
        console.log('Price cal body', body);
        const response = await fetch(url, {
            method: 'POST',
            headers: headersList,
            body: JSON.stringify(body),
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        if (responseData.errorCode == 0) {
            return responseData;
        }else{
            throw new Error(responseData.errorMessage)
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const calculatePriceForTripExtension = async (body: any, bundee_auth_token: string) => {
    const BaseURL = process.env.HOST_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/vehicle/calculatePriceForExtension';

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: bundee_auth_token,
        'Content-Type': 'application/json',
    };

    try {
        console.log('Price cal body', body);
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
        return {
            errorcode: data.errorCode,
            priceCalculatedList: data.priceCalculatedList,
            deductionDetails: data.deductionDetails,
        };
    } catch (error) {
        console.error('Error in price calculation:', error);
        throw new Error('Error in price calculation');
    }
};


export const calculatePriceForTripReduction = async (body: any, bundee_auth_token: string) => {
    const BaseURL = process.env.HOST_SERVICES_BASEURL;

    const url = BaseURL + '/api/v1/vehicle/calculatePriceForReduction';

    const headersList = {
        Accept: '*/*',
        bundee_auth_token: bundee_auth_token,
        'Content-Type': 'application/json',
    };

    try {
        // console.log('Price cal body', body);
        const response = await fetch(url, {
            method: 'POST',
            headers: headersList,
            body: JSON.stringify(body),
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        // console.log(responseData);
        if (responseData.errorCode == 0) {
            return responseData;
        }else{
            throw new Error(responseData.errorMessage)
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};