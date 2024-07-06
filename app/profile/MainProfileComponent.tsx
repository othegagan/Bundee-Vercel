'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import usePhoneNumberVerificationDialog from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { getSession } from '@/lib/auth';
import { getUserByEmail, updateInsuranceProfile, updateProfile } from '@/server/userOperations';
import React, { useEffect, useState } from 'react';
import { MdVerified } from 'react-icons/md';
import AddressSearchBox from './AddressSearchBox';

const ProfilePage = () => {
    const phoneNumberVerification = usePhoneNumberVerificationDialog();

    const [savedData, setSavedData] = useState({
        firstname: '',
        middlename: '',
        lastname: '',
        mobilePhone: '',
        email: '',
        postcode: '',
        city: '',
        state: '',
        country: '',
        userimage: '',
        address1: '',
        address2: '',
        address3: '',
        language: '',
        driverlisense: '',
        vehicleowner: false,
        insuranceCompany: '',
        insuranceNumber: '',
        isPhoneVarified: false,
        isEmailVarified: true,
    });

    const [activeSection, setActiveSection] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    const handleEditClick = (section) => {
        setActiveSection(section);
    };

    const handleCancelClick = () => {
        setActiveSection(null);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const session = await getSession();

        try {
            const userResponse = await getUserByEmail(session.email);
            if (userResponse.success) {
                const data = userResponse.data.userResponse;
                const insuranceData = userResponse.data.driverProfiles[0];

                setSavedData({
                    firstname: data.firstname,
                    middlename: data.middlename,
                    lastname: data.lastname,
                    email: data.email,
                    mobilePhone: data.mobilephone,
                    address1: data.address_1,
                    address2: data.address_2,
                    address3: data.address_3,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    postcode: data.postcode,
                    language: data.language,
                    driverlisense: data.driverlisense,
                    vehicleowner: data.vehicleowner,
                    userimage: data.userimage,
                    isEmailVarified: true,
                    isPhoneVarified: data.isPhoneVarified,
                    insuranceCompany: insuranceData ? insuranceData.insuranceCompany : '',
                    insuranceNumber: insuranceData ? insuranceData.insuranceNumber : '',
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (key, value) => {
        setSavedData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    const handleSubmit = async () => {
        const session = await getSession();
        setProcessing(true);

        const updatePayload = {
            iduser: Number(session.userId),
            firstname: savedData.firstname || '',
            middlename: '',
            lastname: savedData.lastname || '',
            mobilePhone: savedData.mobilePhone || '',
            address_1: savedData.address1 || '',
            address_2: savedData.address2 || '',
            address_3: '',
            city: savedData.city || '',
            state: savedData.state || '',
            postcode: savedData.postcode || '',
            country: savedData.country || 'USA',
            language: savedData.language || '',
            driverlisense: savedData.driverlisense || '',
            vehicleowner: false,
            userimage: savedData.userimage || '',
            isEmailVarified: true,
            isPhoneVarified: savedData.isPhoneVarified,
            fromValue: 'completeProfile',
        };

        try {
            // console.log('Profile Update payload :', updatePayload);
            const response = await updateProfile(updatePayload);
            // console.log(response);
            if (response.success) {
                toast({
                    duration: 3000,
                    variant: 'success',
                    description: 'Profile  updated successful.',
                });
                fetchData();
                handleCancelClick();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Failed to update your profile.',
                });
            }
        } catch (error) {
            console.log('error updating details', error);
            toast({
                duration: 3000,
                variant: 'destructive',
                description: 'Failed to update your profile.',
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleInsuranceSubmit = async () => {
        const session = await getSession();
        setProcessing(true);

        const body = {
            userId: Number(session.userId),
            insuranceUrl: '',
            insuranceCompany: savedData.insuranceCompany,
            insuranceNumber: savedData.insuranceNumber,
        };
        try {
            const response = await updateInsuranceProfile(body);
            if (response.success) {
                toast({
                    duration: 3000,
                    variant: 'success',
                    description: 'Insurance details updated successful.',
                });
                fetchData();
                handleCancelClick();
            } else {
                toast({
                    duration: 3000,
                    variant: 'destructive',
                    description: 'Failed to update your insurance details.',
                });
            }
        } catch (error) {
            console.log('error updating details', error);
            toast({
                duration: 3000,
                variant: 'destructive',
                description: 'Failed to update your insurance details.',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className='mx-auto mt-8 flex flex-col gap-6 md:gap-10'>
            <div className='space-y-4'>
                <div className='border-b-2 border-neutral-900/10 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' text-base font-semibold leading-7'>Name</h2>
                        {activeSection !== 'name' ? (
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={activeSection !== null}
                                className={activeSection === 'phoneNumber' ? 'cursor-not-allowed ' : ''}
                                onClick={() => handleEditClick('name')}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant='secondary' size='sm' onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    {activeSection === 'name' ? (
                        <div className='mt-5 flex flex-col gap-4'>
                            <div className='grid grid-cols-1 gap-4 gap-y-2 pr-5 text-sm md:max-w-md md:grid-cols-4 '>
                                <div className='md:col-span-2'>
                                    <Label>First Name</Label>
                                    <Input
                                        type='text'
                                        value={savedData.firstname}
                                        onChange={(e) => {
                                            handleInputChange('firstname', e.target.value);
                                        }}
                                    />
                                </div>

                                <div className='md:col-span-2'>
                                    <Label>Last Name</Label>
                                    <Input
                                        type='text'
                                        value={savedData.lastname}
                                        onChange={(e) => {
                                            handleInputChange('lastname', e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <Button className='max-w-fit' type='button' disabled={processing} variant='black' onClick={handleSubmit}>
                                {processing ? (
                                    <p>
                                        <div className='loader' />
                                    </p>
                                ) : (
                                    <>Save</>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div>
                            {savedData.firstname} {savedData.lastname}
                        </div>
                    )}
                </div>
            </div>

            <div className='space-y-4'>
                <div className='border-b-2 border-neutral-900/10 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' text-base font-semibold leading-7'> Phone Number</h2>
                        {activeSection !== 'phoneNumber' ? (
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={activeSection !== null}
                                className={activeSection === 'phoneNumber' ? 'cursor-not-allowed ' : ''}
                                onClick={() => {
                                    phoneNumberVerification.onOpen();
                                }}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant='secondary' size='sm' onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    <div>
                        {savedData.mobilePhone}
                        {savedData.isPhoneVarified && (
                            <span className='ml-2 inline-block'>
                                <MdVerified className='size-4 text-green-600' />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className='space-y-4'>
                <div className='border-b-2 border-neutral-900/10 pb-2'>
                    <h2 className=' text-base font-semibold leading-7'>Email</h2>
                    <div>
                        {savedData.email}
                        {savedData.email && (
                            <span className='ml-2 inline-block'>
                                <MdVerified className='size-4 text-green-600' />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className='space-y-4'>
                <div className='border-b-2 border-neutral-900/10 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' text-base font-semibold leading-7'>Address Details</h2>
                        {activeSection !== 'address' ? (
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={activeSection !== null}
                                className={activeSection === 'address' ? 'cursor-not-allowed ' : ''}
                                onClick={() => handleEditClick('address')}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant='secondary' size='sm' onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    {activeSection === 'address' ? (
                        <div className='mt-5 flex flex-col gap-4'>
                            <div className='flex flex-col gap-2'>
                                <Label>Address 1</Label>
                                <AddressSearchBox address1={savedData.address1} setSavedData={setSavedData} />
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label>Address 2</Label>
                                <Input type='text' value={savedData.address2} onChange={(e) => handleInputChange('address2', e.target.value)} />
                            </div>

                            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                                <div className='flex flex-col gap-2'>
                                    <Label>City</Label>
                                    <Input type='text' value={savedData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <Label>State</Label>
                                    <select
                                        id='state'
                                        name='state'
                                        value={savedData.state}
                                        onChange={(e) => {
                                            handleInputChange('state', e.target.value);
                                        }}
                                        className='h-9 rounded border p-1 text-sm outline-none'>
                                        <option value='' disabled>
                                            Select State
                                        </option>
                                        {stateList.map((state) => (
                                            <option key={state.name} value={state.name}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <Label>Zip code</Label>
                                    <Input
                                        type='text'
                                        value={savedData.postcode}
                                        onChange={(e) => {
                                            handleInputChange('postcode', e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <Button className='max-w-fit' type='button' disabled={processing} variant='black' onClick={handleSubmit}>
                                {processing ? (
                                    <p>
                                        <div className='loader' />
                                    </p>
                                ) : (
                                    <>Save</>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div>
                                {savedData.address1 && <>{`${savedData.address1},`} </>}
                                {savedData.address2 && <>{`${savedData.address2}, `} </>}
                                {savedData.city && <>{`${savedData.city}, `} </>}
                                {savedData.state && <>{`${savedData.state}, `} </>}
                                {savedData.postcode && <>{`${savedData.postcode}, `} </>}
                                {savedData.country && <>{savedData.country} </>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='space-y-4'>
                <div className='border-b-2 border-neutral-900/10 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' text-base font-semibold leading-7'>Insurance Details</h2>
                        {activeSection !== 'insurance' ? (
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={activeSection !== null}
                                className={activeSection === 'insurance' ? 'cursor-not-allowed ' : ''}
                                onClick={() => handleEditClick('insurance')}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant='secondary' size='sm' onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    {activeSection === 'insurance' ? (
                        <div className='mt-5 flex flex-col gap-4'>
                            <div className='grid grid-cols-1 gap-4 gap-y-2 pr-5 text-sm md:max-w-md md:grid-cols-4 '>
                                <div className='md:col-span-2'>
                                    <Label>Carrier Name</Label>
                                    <Input
                                        type='text'
                                        value={savedData.insuranceCompany}
                                        onChange={(e) => {
                                            handleInputChange('insuranceCompany', e.target.value);
                                        }}
                                    />
                                </div>

                                <div className='md:col-span-2'>
                                    <Label>Insurance Number</Label>
                                    <Input
                                        type='text'
                                        value={savedData.insuranceNumber}
                                        onChange={(e) => {
                                            handleInputChange('insuranceNumber', e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <Button className='max-w-fit' type='button' disabled={processing} variant='black' onClick={handleInsuranceSubmit}>
                                {processing ? (
                                    <p>
                                        <div className='loader' />
                                    </p>
                                ) : (
                                    <>Save</>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div>
                            {savedData.insuranceCompany} - {savedData.insuranceNumber}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

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
