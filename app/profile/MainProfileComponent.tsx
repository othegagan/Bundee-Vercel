'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getSession } from '@/lib/auth';
import { getUserByEmail, updateInsuranceProfile, updateProfile } from '@/server/userOperations';
import usePhoneNumberVerificationModal from '@/hooks/usePhoneNumberVerificationModal';

const ProfileUpdatePage = ({}) => {
    const phoneNumberVerification = usePhoneNumberVerificationModal();

    const [isDataSavingInprogreess, setIsDataSavingInProgress] = useState(false);

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

    const [address1new, setaddress1] = useState('');
    const [address2new, setaddress2] = useState('');

    const [formData, setFormData] = useState<any>({});

    const [isCurrentlyEditing, setIscurrntlyEditing] = useState(false);

    const handleStateChange = e => {
        handleInputChange('state', e);
    };

    const legalNameAccordionHandler = event => {
        setIscurrntlyEditing(!isCurrentlyEditing);
        event.preventDefault();
        setIsAccordionOpen(prev => !prev);
    };

    const phoneNumberAccordionHandler = event => {
        setIscurrntlyEditing(!isCurrentlyEditing);
        event.preventDefault();
        setIsAccordionOpensecond(prev => !prev);
    };

    const addressNameAccordionHandler = event => {
        setIscurrntlyEditing(!isCurrentlyEditing);
        event.preventDefault();
        setIsAccordionOpenaddress(prev => !prev);
    };

    const insuranceNameAccordionHandler = event => {
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

    const fetchData = async () => {
        const session = await getSession();

        try {
            const userResponse = await getUserByEmail(session.email);
            if (userResponse.success) {
                const data = userResponse.data.userResponse;
                const insuranceData = userResponse.data.driverProfiles[0];
                setFirstNamenew(data['firstname']);
                setLastNamenew(data['lastname']);
                setEmailnew(data['email']);
                setPhoneNumbernew(data['mobilephone']);
                setState(data['state']);
                setCitynew(data['city']);
                setCountry(data['country']);
                setpostCode(data['postcode']);
                setaddress1(data['address_1']);
                setaddress2(data['address_2']);
                setInsurancecarrierName(insuranceData['insuranceCompany']);
                setInsurancecarrierNametNumber(insuranceData['insuranceNumber']);

                const initialFormData = {
                    firstName: data['firstname'],
                    middleName: data['middlename'] || '',
                    lastName: data['lastname'],
                    phoneNumber: data['mobilephone'],
                    email: data['email'],
                    zipCode: data['postcode'],
                    city: data['city'],
                    state: data['state'],
                    country: 'United States',
                    base64Image: data['userimage'],
                    address1: data['address_1'],
                    address2: data['address_2'],
                    address3: data['address_3'],
                    insuranceCarrierName: insuranceData.insuranceName,
                    insuranceCarrierNumber: insuranceData.insuranceNumber,
                    isPhoneVerified: data['isPhoneVerified'],
                };
                setFormData(initialFormData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
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
        const session = await getSession();
        const body = {
            userId: Number(session.userId),
            insuranceUrl: '',
            insuranceNumber: formData.insuranceCarrierNumber,
            insuranceCompany: formData.insuranceCarrierName,
        };

        const response = await updateInsuranceProfile(body);
        if (response.success) {
            setIsDataSavingInProgress(false);
            closeAllAccordion();
            setIscurrntlyEditing(false);
        }
    }

    async function onUploadEvent(event) {
        event.preventDefault();
        const session = await getSession();

        setIsDataSavingInProgress(true);

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

        const updatePayload = {
            iduser: Number(session.userId),
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
            isEmailVerified: true,
            isPhoneVerified: formData.isPhoneVerified,
            fromValue: 'completeProfile',
        };

        try {
            const response = await updateProfile(updatePayload);
            if (response.success) {
                toast({
                    duration: 3000,
                    variant: 'success',
                    description: 'Profile  updated successful.',
                });
                fetchData();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Failed to update your profile.',
                });
            }
        } catch (error) {
            console.log('error updating details', error);
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
            <form className='mt-8 w-full' id='profileUpdateForm'>
                <div className='space-y-12'>
                    <div className='border-b border-gray-900/10 pb-0'>
                        <div className='my-4 border-b-gray-300'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-base font-semibold leading-7 text-gray-900'>Legal Name</h2>

                                {isAccordionOpen && (
                                    <button onClick={e => legalNameAccordionHandler(e)} className='rounded-lg bg-gray-100 px-3 py-3 font-bold text-black'>
                                        Cancel
                                    </button>
                                )}

                                {!isAccordionOpen && (
                                    <button
                                        disabled={isCurrentlyEditing}
                                        onClick={e => legalNameAccordionHandler(e)}
                                        className={`rounded-lg px-3 py-3 font-bold ${isCurrentlyEditing ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-black'}`}>
                                        Edit
                                    </button>
                                )}
                            </div>
                            <div className='grid grid-cols-1 items-center justify-center gap-y-8 sm:grid-cols-1  md:grid-cols-1 lg:grid-cols-1'>
                                <div>
                                    {isAccordionOpen && (
                                        <div className='mt-5 flex flex-col'>
                                            <div className='grid grid-cols-1 gap-4 gap-y-2 pr-5 text-sm md:grid-cols-4'>
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

                                            <div className='mb-2 mt-4'></div>
                                            <Button
                                                disabled={isDataSavingInprogreess}
                                                className='my-6 w-[100px] bg-black text-white hover:bg-gray-800'
                                                onClick={e => onUploadEvent(e)}>
                                                {isDataSavingInprogreess ? (
                                                    <p>
                                                        <div className='loader'></div>
                                                    </p>
                                                ) : (
                                                    <>Save</>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    {!isAccordionOpen && (
                                        <div>
                                            {firstNamenew} {lastNamenew}
                                        </div>
                                    )}
                                    <div className='mt-6 border border-gray-200'></div>
                                </div>
                            </div>

                            {/*
                                second accord */}
                            <div className='flex items-center justify-between '>
                                <h2 className='mt-10 text-base font-semibold leading-7 text-gray-900'>Phone Number</h2>

                                {isAccordionOpensecond && (
                                    <button onClick={e => phoneNumberAccordionHandler(e)} className='rounded-lg bg-gray-100 px-3 py-3 font-bold text-black'>
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        phoneNumberVerification.onOpen();
                                    }}
                                    type='button'
                                    className={`rounded-lg px-3 py-3 font-bold ${isCurrentlyEditing ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-black'}`}>
                                    Edit
                                </button>
                            </div>

                            <div className='grid grid-cols-1 items-center justify-center gap-y-8 sm:grid-cols-1  md:grid-cols-1 lg:grid-cols-1'>
                                <div>
                                    <div>{phoneNumbernew}</div>
                                    <div className='mt-2' style={{ borderTop: '1.5px solid #ccc' }}></div>
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <h2 className='mt-10 text-base font-semibold leading-7 text-gray-900'>Email</h2>
                            </div>

                            <div className='grid grid-cols-1 items-center justify-center gap-y-8 sm:grid-cols-1  md:grid-cols-1 lg:grid-cols-1'>
                                <div>
                                    {isAccordionOpenemail && (
                                        <div className='mt-5 flex flex-col'>
                                            <div className='grid gap-4 gap-y-2 pr-5 text-sm  md:grid-cols-1'>
                                                <div className='md:col-span-2'>
                                                    <label>Email</label>
                                                    <Input
                                                        type='text'
                                                        name='email'
                                                        id='email'
                                                        value={formData.email}
                                                        onChange={e => handleInputChange('email', e)}
                                                    />
                                                    <div className='mt-2'>{/* Input component for First Name */}</div>
                                                </div>
                                            </div>

                                            <div className='mt-4'></div>
                                            <Button
                                                disabled={isDataSavingInprogreess}
                                                className='my-6 w-[100px] bg-black text-white hover:bg-gray-800'
                                                onClick={e => onUploadEvent(e)}>
                                                {isDataSavingInprogreess ? (
                                                    <p>
                                                        <div className='loader'></div>
                                                    </p>
                                                ) : (
                                                    <>Save</>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    {!isAccordionOpenemail && <div> {emailnew}</div>}
                                    <div className='mt-2' style={{ borderTop: '1.5px solid #ccc' }}></div>{' '}
                                </div>
                            </div>

                            <div className='flex items-center justify-between'>
                                <h2 className='mt-10 text-base font-semibold leading-7 text-gray-900'>Address Details</h2>

                                {isAccordionOpenaddress && (
                                    <button onClick={e => addressNameAccordionHandler(e)} className='rounded-lg bg-gray-100 px-3 py-3 font-bold text-black'>
                                        Cancel
                                    </button>
                                )}
                                {!isAccordionOpenaddress && (
                                    <button
                                        disabled={isCurrentlyEditing}
                                        onClick={e => addressNameAccordionHandler(e)}
                                        className={`rounded-lg px-3 py-3 font-bold ${isCurrentlyEditing ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-black'}`}>
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className='grid grid-cols-1 items-center justify-center gap-y-8 sm:grid-cols-1  md:grid-cols-1 lg:grid-cols-1'>
                                <div>
                                    {isAccordionOpenaddress && (
                                        <div className='mt-5 flex flex-col'>
                                            <div className='w-full md:col-span-2'>
                                                <label>Address1</label>
                                                <div className='mt-2 w-full'>
                                                    <Input
                                                        type='text'
                                                        name='address1'
                                                        id='address1'
                                                        value={formData.address1}
                                                        onChange={e => handleInputChange('address1', e)}
                                                    />
                                                </div>
                                            </div>

                                            <div className='mt-3 md:col-span-2'>
                                                <label>Address2</label>
                                                <div className='mt-2 '>
                                                    <Input
                                                        type='text'
                                                        name='address2'
                                                        id='address2'
                                                        value={formData.address2}
                                                        onChange={e => handleInputChange('address2', e)}
                                                    />
                                                </div>
                                            </div>

                                            <div className='mt-3 flex flex-wrap gap-4 pr-5 text-sm'>
                                                <div className='flex-1'>
                                                    <label htmlFor='city'>City</label>
                                                    <div className='mt-2'>
                                                        <Input
                                                            type='text'
                                                            name='city'
                                                            id='city'
                                                            value={formData.city}
                                                            onChange={e => handleInputChange('city', e)}
                                                        />
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
                                                            className='h-9 rounded border p-1 text-sm outline-none'>
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

                                            <div className='mt-3 md:col-span-2'>
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
                                                className='my-6 w-[100px] bg-black text-white hover:bg-gray-800'
                                                onClick={e => onUploadEvent(e)}>
                                                {isDataSavingInprogreess ? (
                                                    <p>
                                                        <div className='loader'></div>
                                                    </p>
                                                ) : (
                                                    <>Save</>
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
                                <h2 className='mt-10 text-base font-semibold leading-7 text-gray-900'>
                                    Insurance Details<span className='ml-2 text-xs text-primary'>(optional)</span>
                                </h2>
                                {isAccordionOpeninsurance && (
                                    <button onClick={e => insuranceNameAccordionHandler(e)} className='rounded-lg bg-gray-100 px-3 py-3 font-bold text-black'>
                                        Cancel
                                    </button>
                                )}

                                {!isAccordionOpeninsurance && (
                                    <button
                                        disabled={isCurrentlyEditing}
                                        onClick={e => insuranceNameAccordionHandler(e)}
                                        className={`rounded-lg px-3 py-3 font-bold ${isCurrentlyEditing ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-black'}`}>
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className='flex grid-cols-1 items-center justify-start gap-y-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1'>
                                {isAccordionOpeninsurance && (
                                    <div className='mt-5 flex w-full flex-col justify-start'>
                                        <div className='flex w-full justify-start gap-8'>
                                            <div className='w-full md:col-span-4'>
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

                                            <div className='w-full md:col-span-4'>
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
                                            className='my-6 w-[100px] bg-black text-white hover:bg-gray-800'
                                            onClick={e => onUploadEventInsurance(e)}>
                                            {isDataSavingInprogreess ? (
                                                <p>
                                                    <div className='loader'></div>
                                                </p>
                                            ) : (
                                                <>Save</>
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

const stateList = [
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
];
