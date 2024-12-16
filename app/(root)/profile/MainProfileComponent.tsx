'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { stateList } from '@/constants';
import { usePhoneNumberVerificationDialog } from '@/hooks/dialogHooks/usePhoneNumberVerificationDialog';
import { useGenerateInsuranceVerificationLink, useInsuranceDetails } from '@/hooks/useDrivingProfile';
import { getSession } from '@/lib/auth';
import { getUserByEmail, updateInsuranceProfile, updateProfile } from '@/server/userOperations';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { MdVerified } from 'react-icons/md';
import { toast } from 'sonner';
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
        isEmailVarified: true
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
                    insuranceNumber: insuranceData ? insuranceData.insuranceNumber : ''
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (key, value) => {
        setSavedData((prevData) => ({
            ...prevData,
            [key]: value
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
            fromValue: 'completeProfile'
        };

        try {
            // console.log('Profile Update payload :', updatePayload);
            const response = await updateProfile(updatePayload);
            // console.log(response);
            if (response.success) {
                toast.success('Profile  updated successful.');
                fetchData();
                handleCancelClick();
            } else {
                toast.error('Failed to update your profile.');
            }
        } catch (error) {
            console.log('error updating details', error);
            toast.error('Failed to update your profile.');
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
            insuranceNumber: savedData.insuranceNumber
        };
        try {
            const response = await updateInsuranceProfile(body);
            if (response.success) {
                toast.success('Insurance details updated successful.');

                fetchData();
                handleCancelClick();
            } else {
                toast.error('Failed to update your insurance details.');
            }
        } catch (error) {
            console.log('error updating details', error);
            toast.error('Failed to update your insurance details.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className='mx-auto mt-8 flex flex-col gap-6 md:gap-10'>
            <div className='space-y-4'>
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' font-semibold text-base leading-7'>Name</h2>
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
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' font-semibold text-base leading-7'> Phone Number</h2>
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
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <h2 className=' font-semibold text-base leading-7'>Email</h2>
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
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' font-semibold text-base leading-7'>Address Details</h2>
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
                                {savedData.address1 && `${savedData.address1},`}
                                {savedData.address2 && `${savedData.address2}, `}
                                {savedData.city && `${savedData.city}, `}
                                {savedData.state && `${savedData.state}, `}
                                {savedData.postcode && `${savedData.postcode}, `}
                                {savedData.country && savedData.country}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* <div className='space-y-4'>
                <div className='border-neutral-900/10 border-b-2 pb-2'>
                    <div className='flex items-center justify-between'>
                        <h2 className=' font-semibold text-base leading-7'>Insurance Details</h2>
                    </div>
                    <InsuranceContent />
                </div>
            </div> */}
        </div>
    );
};

export default ProfilePage;

function InsuranceContent() {
    const { data: response, isLoading, error } = useInsuranceDetails();

    if (isLoading) {
        return null;
    }

    if (error || !response?.success) {
        return <div>{error?.message || 'Error fetching insurance details'}</div>;
    }

    const insuranceDetails = response.data?.insuranceDetails[0];

    if (!insuranceDetails) {
        return (
            <div className='flex justify-between'>
                <p>Insurance Not verified</p> <InsuranceVerificationLinkGenerateButton />{' '}
            </div>
        );
    }

    if (insuranceDetails.verifiedStatus === 'notVerified' || insuranceDetails.verifiedStatus === 'failed') {
        return (
            <div className='flex justify-between'>
                <p>Insurance Not verified</p> <InsuranceVerificationLinkGenerateButton />{' '}
            </div>
        );
    }

    if (insuranceDetails.verifiedStatus === 'inProgress') {
        return <div>Insurance verification in progress</div>;
    }

    return (
        <div className='divide-y divide-gray-100'>
            <Field label='Carrier'>{insuranceDetails.insuranceProvider.name}</Field>
            <Field label='Policy Number'>{insuranceDetails.policyNumber}</Field>
            <Field label='Policy Validity'>
                {format(insuranceDetails.startDate, 'PP')} - {format(insuranceDetails.expiryDate, 'PP')}
            </Field>

            <Field label='Insureds'> {insuranceDetails.policyHolders.map((holder) => holder.name).join(' / ')}</Field>

            <Field label='Coverages'>
                <ul className='space-y-2 text-sm'>
                    <li>
                        <span className='font-semibold'>Bodily Injury:</span>
                        <span>
                            {' '}
                            ${insuranceDetails.coverages.bodilyInjury.perPerson} / ${insuranceDetails.coverages.bodilyInjury.perAccident}
                        </span>
                    </li>
                    <li>
                        <span className='font-semibold'>Property Damage:</span>
                        <span> ${insuranceDetails.coverages.propertyDamage.perAccident}</span>
                    </li>
                    <li>
                        <span className='font-semibold'>Collision:</span>
                        <span> Deductible: ${insuranceDetails.coverages.collision.deductible}</span>
                    </li>
                    <li>
                        <span className='font-semibold'>Comprehensive:</span> Deductible: ${insuranceDetails.coverages.comprehensive.deductible}
                    </li>
                </ul>
            </Field>
        </div>
    );
}

function Field({ label, children }: { label: string; children: any }) {
    return (
        <div className='px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
            <dt className='font-medium text-sm leading-6'>{label}</dt>
            <dd className='mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0'>{children}</dd>
        </div>
    );
}

function InsuranceVerificationLinkGenerateButton() {
    const { refetch: generateLink, data: linkResponse, isLoading: isGeneratingLink, error: linkError } = useGenerateInsuranceVerificationLink();

    const handleReVerify = async () => {
        try {
            const result = await generateLink();
            if (result.data?.success && result.data?.data?.uri) {
                window.open(result.data.data.uri, '_blank');
            } else {
                throw new Error('Failed to generate verification link');
            }
        } catch (err) {
            toast.error('Failed to generate verification link');
        }
    };

    return (
        <Button variant='outline' size='sm' onClick={handleReVerify} disabled={isGeneratingLink}>
            {isGeneratingLink ? 'Generating Link...' : 'Verify Insurance'}
        </Button>
    );
}
