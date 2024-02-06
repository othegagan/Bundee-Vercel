'use client';

import { useState, useEffect } from 'react';
import { updateExistUser } from '@/app/_actions/update_profile';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { getAllCountries } from '@/app/_actions/getAllcountry';
import { Button } from '@/components/ui/button';
import { fetchProfileDetails } from '@/app/_actions/fetchprofiledetails';
import { updateExistUserInsuranceProfile } from '../_actions/update_insurance';
import { getUserInsuranceProfile } from '../_actions/getInsuranceDetails';
import { toast } from '@/components/ui/use-toast';

const ProfileUpdatePage = ({}) => {
    const [isDataSavingInprogreess, setIsDataSavingInProgress] = useState(false);

    const searchParams = useSearchParams();
    const [userID, setuserId] = useState('');
    const [bundeeToken, setToken] = useState('');
    const [image, setImage] = useState('');
    const [namesList, setNamesList] = useState([]);

    const [stateList, setStateList] = useState([
        { id: 1, name: 'Alabama', abbreviation: 'AL' },
        { id: 2, name: 'Alaska', abbreviation: 'AK' },
        { id: 3, name: 'Arizona', abbreviation: 'AZ' },
        { id: 4, name: 'Arkansas', abbreviation: 'AR' },
        { id: 5, name: 'California', abbreviation: 'CA' },
        { id: 6, name: 'Colorado', abbreviation: 'CO' },
        { id: 7, name: 'Connecticut', abbreviation: 'CT' },
        { id: 8, name: 'Delaware', abbreviation: 'DE' },
        { id: 9, name: 'Florida', abbreviation: 'FL' },
        { id: 10, name: 'Georgia', abbreviation: 'GA' },
        { id: 11, name: 'Hawaii', abbreviation: 'HI' },
        { id: 12, name: 'Idaho', abbreviation: 'ID' },
        { id: 13, name: 'Illinois', abbreviation: 'IL' },
        { id: 14, name: 'Indiana', abbreviation: 'IN' },
        { id: 15, name: 'Iowa', abbreviation: 'IA' },
        { id: 16, name: 'Kansas', abbreviation: 'KS' },
        { id: 17, name: 'Kentucky', abbreviation: 'KY' },
        { id: 18, name: 'Louisiana', abbreviation: 'LA' },
        { id: 19, name: 'Maine', abbreviation: 'ME' },
        { id: 20, name: 'Maryland', abbreviation: 'MD' },
        { id: 21, name: 'Massachusetts', abbreviation: 'MA' },
        { id: 22, name: 'Michigan', abbreviation: 'MI' },
        { id: 23, name: 'Minnesota', abbreviation: 'MN' },
        { id: 24, name: 'Mississippi', abbreviation: 'MS' },
        { id: 25, name: 'Missouri', abbreviation: 'MO' },
        { id: 26, name: 'Montana', abbreviation: 'MT' },
        { id: 27, name: 'Nebraska', abbreviation: 'NE' },
        { id: 28, name: 'Nevada', abbreviation: 'NV' },
        { id: 29, name: 'New Hampshire', abbreviation: 'NH' },
        { id: 30, name: 'New Jersey', abbreviation: 'NJ' },
        { id: 31, name: 'New Mexico', abbreviation: 'NM' },
        { id: 32, name: 'New York', abbreviation: 'NY' },
        { id: 33, name: 'North Carolina', abbreviation: 'NC' },
        { id: 34, name: 'North Dakota', abbreviation: 'ND' },
        { id: 35, name: 'Ohio', abbreviation: 'OH' },
        { id: 36, name: 'Oklahoma', abbreviation: 'OK' },
        { id: 37, name: 'Oregon', abbreviation: 'OR' },
        { id: 38, name: 'Pennsylvania', abbreviation: 'PA' },
        { id: 39, name: 'Rhode Island', abbreviation: 'RI' },
        { id: 40, name: 'South Carolina', abbreviation: 'SC' },
        { id: 41, name: 'South Dakota', abbreviation: 'SD' },
        { id: 42, name: 'Tennessee', abbreviation: 'TN' },
        { id: 43, name: 'Texas', abbreviation: 'TX' },
        { id: 44, name: 'Utah', abbreviation: 'UT' },
        { id: 45, name: 'Vermont', abbreviation: 'VT' },
        { id: 46, name: 'Virginia', abbreviation: 'VA' },
        { id: 47, name: 'Washington', abbreviation: 'WA' },
        { id: 48, name: 'West Virginia', abbreviation: 'WV' },
        { id: 49, name: 'Wisconsin', abbreviation: 'WI' },
        { id: 50, name: 'Wyoming', abbreviation: 'WY' },
    ]);

    const [selectedCountry, setSelectedCountry] = useState('');

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isAccordionOpensecond, setIsAccordionOpensecond] = useState(false);
    const [isAccordionOpenemail, setIsAccordionOpenemail] = useState(false);
    const [isAccordionOpenaddress, setIsAccordionOpenaddress] = useState(false);
    const [isAccordionOpeninsurance, setIsAccordionOpeninsurance] = useState(false);

    const [firstNamenew, setFirstNamenew] = useState('');
    const [insuranceCarrierName, setInsurancecarrierName] = useState('');
    const [insuranceCarrierNumber, setInsurancecarrierNametNumber] = useState('');
    const [lastNamenew, setLastNamenew] = useState('');
    const [emailnew, setEmailnew] = useState('');
    const [phoneNumbernew, setPhoneNumbernew] = useState('');
    const [citynew, setCitynew] = useState('');
    const [postCode, setpostCode] = useState('');
    const [statenew, setState] = useState('');
    const [countrynew, setCountry] = useState('');
    const [isVerified, setIsVerfied] = useState('');
    const [address1new, setaddress1] = useState('');
    const [address2new, setaddress2] = useState('');
    const [address3, setaddress3] = useState('');
    const [errorCode, seterrorCode] = useState('');

    const items = ['Edit Profile', 'Persona Verification', 'Change Password'];

    const [formData, setFormData] = useState<any>({});

    const [activeIndex, setActiveFormIndex] = useState(0);
    const [isCurrentlyEditing, setIscurrntlyEditing] = useState(false);

    const handleCountry = e => {
        handleInputChange('country', e);
    };

    const handleStateChange = e => {
        handleInputChange('state', e);
    };

    var email;
    var callApi;

    const legalNameAccordionHandler = (event, currentIndex) => {
        setIscurrntlyEditing(!isCurrentlyEditing);
        // setActiveFormIndex(currentIndex);
        event.preventDefault();
        setIsAccordionOpen(prev => !prev);
    };

    const phoneNumberAccordionHandler = (event, currentIndex) => {
        // setActiveFormIndex(currentIndex);
        setIscurrntlyEditing(!isCurrentlyEditing);
        event.preventDefault();
        setIsAccordionOpensecond(prev => !prev);
    };

    const emailAccordionHandler = (event, currentIndex) => {
        // setActiveFormIndex(currentIndex);
        setIscurrntlyEditing(!isCurrentlyEditing);
        event.preventDefault();
        setIsAccordionOpenemail(prev => !prev);
    };

    const addressNameAccordionHandler = (event, currentIndex) => {
        // setActiveFormIndex(currentIndex);
        setIscurrntlyEditing(!isCurrentlyEditing);
        event.preventDefault();
        setIsAccordionOpenaddress(prev => !prev);
    };

    const insuranceNameAccordionHandler = (event, currentIndex) => {
        // setActiveFormIndex(currentIndex);
        setIscurrntlyEditing(!isCurrentlyEditing);
        event.preventDefault();
        setIsAccordionOpeninsurance(prev => !prev);
    };

    function closeAllAccordion() {
        setIsAccordionOpeninsurance(false);
        setIsAccordionOpenaddress(false);
        setIsAccordionOpenemail(false);
        setIsAccordionOpensecond(false);
        setIsAccordionOpen(false);
    }

    useEffect(() => {
        const bundee_auth_token = localStorage.getItem('bundee_auth_token');
        const userEmail = localStorage.getItem('session_user');
        setToken(bundee_auth_token);
        const userId = localStorage.getItem('userId');
        setSelectedCountry(searchParams.get('country') || '');
        setuserId(userId);

        const getCountry = async () => {
            callApi = await getAllCountries();
            setNamesList(callApi);

            const bundee_auth_token = localStorage.getItem('bundee_auth_token');
            const userId = localStorage.getItem('userId');
            const email = localStorage.getItem('session_user');

            const userCheckData = {
                channelName: 'Bundee',
                email: email,
            };

            const body = {
                iduser: userId,
            };

            const fetchData = async () => {
                try {
                    const data = await fetchProfileDetails(body, bundee_auth_token);
                    const insuranceData = await getUserInsuranceProfile(userEmail, bundee_auth_token);

                    setFirstNamenew(data['firstName']);
                    setLastNamenew(data['lastName']);
                    setEmailnew(data['email']);
                    setPhoneNumbernew(data['phoneNumber']);
                    setState(data['state']);
                    setCitynew(data['city']);
                    setCountry(data['country']);
                    setpostCode(data['postCode']);
                    setaddress1(data['address1']);
                    setaddress2(data['address2']);
                    setaddress3(data['address3']);
                    setImage(data['userImage']);
                    seterrorCode(data['errorcode']);
                    setInsurancecarrierName(insuranceData.insuranceName);
                    setInsurancecarrierNametNumber(insuranceData.insuranceNumber);

                    const initialFormData = {
                        firstName: data['firstName'],
                        middleName: data['middleName'] || '',
                        lastName: data['lastName'],
                        phoneNumber: data['phoneNumber'],
                        email: data['email'],
                        zipCode: data['postCode'],
                        city: data['city'],
                        state: data['state'],
                        country: 'United States',
                        base64Image: data['userImage'],
                        address1: data['address1'],
                        address2: data['address2'],
                        address3: data['address3'],
                        insuranceCarrierName: insuranceData.insuranceName,
                        insuranceCarrierNumber: insuranceData.insuranceNumber,
                    };

                    setFormData(initialFormData);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        };
        getCountry();
    }, []);

    const handleInputChange = (key, event) => {
        setFormData(prevData => ({
            ...prevData,
            [key]: event.target.value,
        }));
    };

    async function onUploadEventInsurance(e: any) {
        e.preventDefault();
        setIsDataSavingInProgress(true);

        setInsurancecarrierName(formData.insuranceCarrierName);
        setInsurancecarrierNametNumber(formData.insuranceCarrierNumber);

        const body = {
            userId: Number(userID),
            insuranceUrl: '',
            insuranceNumber: formData.insuranceCarrierNumber,
            insuranceCompany: formData.insuranceCarrierName,
        };

        await updateExistUserInsuranceProfile(body, bundeeToken);

        setIsDataSavingInProgress(false);
        closeAllAccordion();
        setIscurrntlyEditing(false);
    }

    async function onUploadEvent(event) {
        event.preventDefault();

        setIsDataSavingInProgress(true);

        // alert("State is updated successfully");

        setFirstNamenew(formData.firstName);
        setLastNamenew(formData.lastName);

        setPhoneNumbernew(formData.phoneNumber);

        setaddress1(formData.address1);
        setaddress2(formData.address2);
        setCitynew(formData.city);
        setCountry(formData.country);
        setpostCode(formData.zipCode);
        setState(formData.state);

        setInsurancecarrierName(formData.insuranceCarrierName);
        setInsurancecarrierNametNumber(formData.insuranceCarrierNumber);

        // alert(formData.lastName);

        const body = {
            iduser: Number(userID),
            firstname: formData.firstName,
            middlename: '',
            lastname: formData.lastName,
            mobilePhone: formData.phoneNumber,
            address_1: formData.address1 || '',
            address_2: formData.address2 || '',
            address_3: formData.address3 || '',
            city: formData.city || '',
            state: formData.state || '',
            postcode: formData.zipCode || '',
            country: 'USA',
            language: 'NA',
            driverlisense: 'NA',
            vehicleowner: false,
            userimage: formData.base64Image || '',
            fromValue: 'completeProfile',
        };

        try {
            const response = await updateExistUser(body, bundeeToken);

            if (response.errorcode == '0') {
                toast({
                    duration: 3000,
                    className: 'bg-green-400 text-white',
                    title: 'Profile  updated successful.',
                    description: 'Your profile  has been updated successfully.',
                });
            } else {
                toast({
                    duration: 3000,
                    className: 'bg-red-400 text-white',
                    title: 'Oops something went wrong.',
                    description: 'Failed to update your profile.',
                });
            }
        } catch (error) {
            console.log('error updating details');
            toast({
                duration: 3000,
                className: 'bg-red-400 text-white',
                title: 'Oops something went wrong.',
                description: 'Failed to update your profile.',
            });
        }

        setIsDataSavingInProgress(false);
        closeAllAccordion();
        setIscurrntlyEditing(false);
    }

    function isInsuranceDataUnavailable() {
        return !insuranceCarrierName && !insuranceCarrierNumber;
    }

    return (
        <>
            <form className='w-full mt-8' id='profileUpdateForm'>
                <div className='space-y-12'>
                    <div className='border-b border-gray-900/10 pb-0'>
                        <div className='border-b-gray-300 my-4'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-base font-semibold leading-7 text-gray-900'>Legal Name</h2>

                                {isAccordionOpen && (
                                    <button onClick={e => legalNameAccordionHandler(e, 0)} className='px-3 py-3 rounded-lg font-bold bg-gray-100 text-black'>
                                        Cancel
                                    </button>
                                )}

                                {!isAccordionOpen && (
                                    <button
                                        disabled={isCurrentlyEditing}
                                        onClick={e => legalNameAccordionHandler(e, 1)}
                                        className={`px-3 py-3 rounded-lg font-bold ${isCurrentlyEditing ? 'text-gray-400 bg-gray-100' : 'text-black bg-gray-100'}`}>
                                        Edit
                                    </button>
                                )}
                            </div>
                            <div className='grid grid-cols-1 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1  items-center justify-center'>
                                <div>
                                    {isAccordionOpen && (
                                        <div className='flex flex-col mt-5'>
                                            <div className='grid gap-4 gap-y-2 pr-5 text-sm grid-cols-1 md:grid-cols-4'>
                                                <div className='md:col-span-2'>
                                                    <label>First Name</label>
                                                    <div className='mt-2 '>
                                                        <Input
                                                            type='text'
                                                            name='first-name'
                                                            id='first-name'
                                                            value={formData.firstName}
                                                            onChange={e => handleInputChange('firstName', e)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className='md:col-span-2'>
                                                    <label>Last Name</label>
                                                    <div className='mt-2     '>
                                                        <Input
                                                            type='text'
                                                            name='last-name'
                                                            id='last-name'
                                                            value={formData.lastName}
                                                            onChange={e => handleInputChange('lastName', e)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* New text element below the input boxes */}

                                            <div className='mt-4 mb-2'></div>
                                            <Button
                                                disabled={isDataSavingInprogreess}
                                                className='bg-black hover:bg-gray-800 text-white w-[100px] my-6'
                                                onClick={e => onUploadEvent(e)}>
                                                {isDataSavingInprogreess ? (
                                                    <p>
                                                        <div className='loader'></div>
                                                    </p>
                                                ) : (
                                                    <p>Save</p>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    {!isAccordionOpen && (
                                        <div>
                                            {firstNamenew} {lastNamenew}
                                        </div>
                                    )}
                                    <div className='border border-gray-200 mt-6'></div>
                                </div>
                            </div>

                            {/*
                                second accord */}
                            <div className='flex items-center justify-between '>
                                <h2 className='text-base font-semibold leading-7 text-gray-900 mt-10'>Phone Number</h2>

                                {isAccordionOpensecond && (
                                    <button onClick={e => phoneNumberAccordionHandler(e, 0)} className='px-3 py-3 rounded-lg font-bold bg-gray-100 text-black'>
                                        Cancel
                                    </button>
                                )}
                                {!isAccordionOpensecond && (
                                    <button
                                        disabled={isCurrentlyEditing}
                                        onClick={e => phoneNumberAccordionHandler(e, 2)}
                                        className={`px-3 py-3 rounded-lg font-bold ${isCurrentlyEditing ? 'text-gray-400 bg-gray-100' : 'text-black bg-gray-100'}`}>
                                        Edit
                                    </button>
                                )}
                            </div>

                            {/* New accordion */}
                            <div className='grid grid-cols-1 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1  items-center justify-center'>
                                <div>
                                    {isAccordionOpensecond && (
                                        <div className='flex flex-col mt-5'>
                                            <div className='grid gap-4 gap-y-2 pr-5 text-sm  md:grid-cols-1'>
                                                <div className='md:col-span-2'>
                                                    <label>Mobile Phone Number</label>
                                                    {/* <Input type='text' name='phone-number' id='phone-number' value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e)} /> */}
                                                </div>

                                                <div className='flex items-center'>
                                                    <button
                                                        id='dropdown-phone-button'
                                                        data-dropdown-toggle='dropdown-phone'
                                                        className='flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-l-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600'
                                                        type='button'>
                                                        {/* Country code dropdown button content */}
                                                        +1
                                                        {/* Dropdown Icon */}
                                                    </button>
                                                    {/* Dropdown Menu */}
                                                    <div id='dropdown-phone' className='hidden z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-52 dark:bg-gray-700'>
                                                        {/* Dropdown items for other countries */}
                                                    </div>
                                                    <label htmlFor='phone-input' className='mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white'>
                                                        Phone number:
                                                    </label>
                                                    <div className='relative w-full'>
                                                        <input
                                                            type='text'
                                                            id='phone-input'
                                                            value={formData.phoneNumber}
                                                            onChange={e => handleInputChange('phoneNumber', e)}
                                                            className='block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-r-lg border-l-0 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-l-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500'
                                                            pattern='(\+01)?\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}'
                                                            placeholder='(123) 456-7890'
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt-4'></div>
                                            <Button
                                                disabled={isDataSavingInprogreess}
                                                className='bg-black hover:bg-gray-800 text-white w-[100px] my-6'
                                                onClick={e => onUploadEvent(e)}>
                                                {isDataSavingInprogreess ? (
                                                    <p>
                                                        <div className='loader'></div>
                                                    </p>
                                                ) : (
                                                    <p>Save</p>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    {!isAccordionOpensecond && <div>{phoneNumbernew}</div>}
                                    <div className='mt-2' style={{ borderTop: '1.5px solid #ccc' }}></div>
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <h2 className='text-base font-semibold leading-7 text-gray-900 mt-10'>Email</h2>
                            </div>

                            <div className='grid grid-cols-1 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1  items-center justify-center'>
                                <div>
                                    {isAccordionOpenemail && (
                                        <div className='flex flex-col mt-5'>
                                            <div className='grid gap-4 gap-y-2 pr-5 text-sm  md:grid-cols-1'>
                                                <div className='md:col-span-2'>
                                                    <label>Email</label>
                                                    <Input type='text' name='email' id='email' value={formData.email} onChange={e => handleInputChange('email', e)} />
                                                    <div className='mt-2'>{/* Input component for First Name */}</div>
                                                </div>
                                            </div>

                                            <div className='mt-4'></div>
                                            <Button
                                                disabled={isDataSavingInprogreess}
                                                className='bg-black hover:bg-gray-800 text-white w-[100px] my-6'
                                                onClick={e => onUploadEvent(e)}>
                                                {isDataSavingInprogreess ? (
                                                    <p>
                                                        <div className='loader'></div>
                                                    </p>
                                                ) : (
                                                    <p>Save</p>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    {!isAccordionOpenemail && <div> {emailnew}</div>}
                                    <div className='mt-2' style={{ borderTop: '1.5px solid #ccc' }}></div>{' '}
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <h2 className='text-base font-semibold leading-7 text-gray-900 mt-10'>Address Details</h2>

                                {isAccordionOpenaddress && (
                                    <button onClick={e => addressNameAccordionHandler(e, 0)} className='px-3 py-3 rounded-lg font-bold bg-gray-100 text-black'>
                                        Cancel
                                    </button>
                                )}
                                {!isAccordionOpenaddress && (
                                    <button
                                        disabled={isCurrentlyEditing}
                                        onClick={e => addressNameAccordionHandler(e, 3)}
                                        className={`px-3 py-3 rounded-lg font-bold ${isCurrentlyEditing ? 'text-gray-400 bg-gray-100' : 'text-black bg-gray-100'}`}>
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className='grid grid-cols-1 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1  items-center justify-center'>
                                <div>
                                    {isAccordionOpenaddress && (
                                        <div className='flex flex-col mt-5'>
                                            <div className='md:col-span-2 w-full'>
                                                <label>Address1</label>
                                                <div className='mt-2 w-full'>
                                                    <Input type='text' name='address1' id='address1' value={formData.address1} onChange={e => handleInputChange('address1', e)} />
                                                </div>
                                            </div>

                                            <div className='md:col-span-2 mt-3'>
                                                <label>Address2</label>
                                                <div className='mt-2 '>
                                                    <Input type='text' name='address2' id='address2' value={formData.address2} onChange={e => handleInputChange('address2', e)} />
                                                </div>
                                            </div>

                                            <div className='flex flex-wrap gap-4 pr-5 text-sm mt-3'>
                                                <div className='flex-1'>
                                                    <label htmlFor='city'>City</label>
                                                    <div className='mt-2'>
                                                        <Input type='text' name='city' id='city' value={formData.city} onChange={e => handleInputChange('city', e)} />
                                                    </div>
                                                </div>

                                                <div className='flex-1'>
                                                    <label htmlFor='state'>State</label>
                                                    <div className='mt-2'>
                                                        <select
                                                            id='state'
                                                            name='state'
                                                            value={formData.state}
                                                            onChange={handleStateChange}
                                                            className='border rounded p-1 text-sm h-9 outline-none'>
                                                            <option value='' disabled>
                                                                Select State
                                                            </option>
                                                            {stateList.map(state => (
                                                                <option key={state.name} value={state.name}>
                                                                    {state.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className='flex-1'>
                                                    <label htmlFor='postal code'>Postal Code</label>
                                                    <div className='mt-2'>
                                                        <Input
                                                            type='text'
                                                            maxLength={6}
                                                            name='postal code'
                                                            id='postal code'
                                                            value={formData.zipCode}
                                                            onChange={e => {
                                                                handleInputChange('zipCode', e);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='md:col-span-2 mt-3'>
                                                <label htmlFor='country' className='block text-sm font-medium leading-6 text-gray-900'>
                                                    Country
                                                </label>
                                                <div className='mt-2 '>
                                                    <Input
                                                        type='text'
                                                        name='postal code'
                                                        id='postal code'
                                                        value={formData.country}
                                                        onChange={e => handleInputChange('country', e)}
                                                        placeholder='United States'
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <div className='mt-4'></div>
                                            <Button
                                                disabled={isDataSavingInprogreess}
                                                className='bg-black hover:bg-gray-800 text-white w-[100px] my-6'
                                                onClick={e => onUploadEvent(e)}>
                                                {isDataSavingInprogreess ? (
                                                    <p>
                                                        <div className='loader'></div>
                                                    </p>
                                                ) : (
                                                    <p>Save</p>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    {!isAccordionOpenaddress && (
                                        <div>
                                            {address1new && <>{address1new + ','} </>}
                                            {address2new && <>{address2new + ', '} </>}
                                            {citynew && <>{citynew + ', '} </>}
                                            {postCode && <>{postCode + ', '} </>}
                                            {countrynew && <>{countrynew} </>}
                                        </div>
                                    )}
                                    <div className='mt-2' style={{ borderTop: '1.5px solid #ccc' }}></div>{' '}
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <h2 className='text-base font-semibold leading-7 text-gray-900 mt-10'>
                                    Insurance Details<span className='text-primary text-xs ml-2'>(optional)</span>
                                </h2>
                                {isAccordionOpeninsurance && (
                                    <button onClick={e => insuranceNameAccordionHandler(e, 0)} className='px-3 py-3 rounded-lg font-bold bg-gray-100 text-black'>
                                        Cancel
                                    </button>
                                )}

                                {!isAccordionOpeninsurance && (
                                    <button
                                        disabled={isCurrentlyEditing}
                                        onClick={e => insuranceNameAccordionHandler(e, 4)}
                                        className={`px-3 py-3 rounded-lg font-bold ${isCurrentlyEditing ? 'text-gray-400 bg-gray-100' : 'text-black bg-gray-100'}`}>
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className='grid-cols-1 gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 flex items-center justify-start'>
                                {isAccordionOpeninsurance && (
                                    <div className='flex flex-col mt-5 justify-start w-full'>
                                        <div className='flex justify-start gap-8 w-full'>
                                            <div className='md:col-span-4 w-full'>
                                                <label htmlFor='insurance-company-name'>Insurance Carrier Name</label>
                                                <div className='mt-2 w-full'>
                                                    <Input
                                                        type='text'
                                                        name='insurance-company-name'
                                                        value={formData.insuranceCarrierName}
                                                        onChange={e => handleInputChange('insuranceCarrierName', e)}
                                                        id='insurance-company-name'
                                                    />
                                                </div>
                                            </div>

                                            <div className='md:col-span-4 w-full'>
                                                <label htmlFor='insurance-carrier-name'>Insurance Number</label>
                                                <div className='mt-2 w-full'>
                                                    <Input
                                                        type='text'
                                                        name='insurance-carrier-name'
                                                        value={formData.insuranceCarrierNumber}
                                                        onChange={e => handleInputChange('insuranceCarrierNumber', e)}
                                                        id='insurance-carrier-name'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            disabled={isDataSavingInprogreess}
                                            className='bg-black hover:bg-gray-800 text-white w-[100px] my-6'
                                            onClick={e => onUploadEventInsurance(e)}>
                                            {isDataSavingInprogreess ? (
                                                <p>
                                                    <div className='loader'></div>
                                                </p>
                                            ) : (
                                                <p>Save</p>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {!isAccordionOpeninsurance && (
                                    <div>
                                        {isInsuranceDataUnavailable() ? (
                                            <div>
                                                <p>No data Available</p>
                                            </div>
                                        ) : (
                                            <div>
                                                {insuranceCarrierName} {insuranceCarrierNumber}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};
export default ProfileUpdatePage;
