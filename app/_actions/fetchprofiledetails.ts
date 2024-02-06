"use server"

export const fetchProfileDetails = async (body: any, bundee_auth_token: string) => {


    const BaseURL = process.env.USER_MANAGEMENT_BASEURL;

    const url = BaseURL + '/api/v1/user/getUserById';



    const headersList = {
        Accept: '*/*',
        'bundee_auth_token': bundee_auth_token,
        'Content-Type': 'application/json',
    };


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
        return {
            errorcode: data.errorCode,
            iduser: data.userResponse['iduser'],
            firstName: data.userResponse['firstname'],
            middleName: data.userResponse['middlename'],
            lastName: data.userResponse['lastname'],
            phoneNumber: data.userResponse['mobilephone'],
            email: data.userResponse['email'],
            postCode: data.userResponse['postcode'],
            country: data.userResponse['country'],
            city: data.userResponse['city'],
            state: data.userResponse['state'],
            isVerified: data.userResponse['isVerified'],
            address1: data.userResponse['address_1'],
            address2: data.userResponse['address_2'],
            address3: data.userResponse['address_3'],
            userImage: data.userResponse['userimage'],
        };

    } catch (error) {
        console.error('Error Fetching new user:', error);
        throw new Error(error);
    }
};
