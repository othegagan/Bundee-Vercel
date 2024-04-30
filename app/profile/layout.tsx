'use client';
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUserByEmail, updateProfile } from '@/server/userOperations';
import { getSession } from '@/lib/auth';
import BoxContainer from '@/components/BoxContainer';

const layout = ({ children }: { children: React.ReactNode }) => {
    const pathName = usePathname();
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dbImage, setDbimage] = useState('');

    const fetchData = async () => {
        try {
            const session = await getSession();
            const response = await getUserByEmail(session.email);
            if (response.success) {
                const data = response.data.userResponse;
                setImage(data.userimage);
                setName(data.firstName);
                setEmail(data.email);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleProfilePictureChange = async event => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 1048576) {
                toast({
                    duration: 4000,
                    variant: 'destructive',
                    description: 'Please select an image size less than 1 MB.',
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                const resultAsString = reader.result as string;
                setImage(resultAsString);
                try {
                    const session = await getSession();
                    const response = await getUserByEmail(session.email);
                    if (response.success) {
                        const data = response.data.userResponse;
                        // console.log(data)
                        const payload = {
                            iduser: data.iduser,
                            firstname: data.firstname,
                            middlename: '',
                            lastname: data.lastname || '',
                            mobilePhone: data.mobilephone || '+91-9036644552',
                            address_1: data.address_1 || '',
                            address_2: data.address_2 || '',
                            address_3: data.address_3 || '',
                            city: data.city || '',
                            state: data.state || '',
                            postcode: data.postCode || '',
                            country: data.country || "",
                            language: data.language || "",
                            driverlisense: data.driverlisense || "",
                            vehicleowner: false,
                            fromValue: 'completeProfile',
                            userimage: resultAsString.split(',')[1]  || "",
                            isPhoneVarified: data.isPhoneVarified,
                            isEmailVarified: true,
                        };

                        const updateResponse = await updateProfile(payload);
                        if (updateResponse.success) {
                            toast({
                                duration: 3000,
                                variant: 'success',
                                description: 'Profile photo updated successful.',
                            });
                        } else {
                            toast({
                                duration: 3000,
                                variant: 'destructive',
                                description: 'Something went wrong, Try again.',
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error updating profile data:', error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const links = [
        { id: 1, name: 'Basic Profile', path: '/profile' },
        { id: 2, name: 'Driving Licence Verification', path: '/profile/driving-licence' },
        { id: 3, name: 'Change Password', path: '/profile/change-password' },
        { id: 4, name: 'Delete Account', path: '/profile/delete-account' },
    ];

    return (
        <div>
            <div className='flex min-h-[80vh] flex-col lg:hidden'>
                <BoxContainer className='py-10'>
                    <div className='flex gap-3'>
                        <div className='col-span-1 flex flex-col gap-1'>
                            <img
                                src={image ? `${image}` : '/dummy_avatar.png'}
                                alt=''
                                className=' relative inline-block h-[100px] w-[100px] md:h-[200px] md:w-[200px] rounded-md  object-cover object-center'
                            />
                        </div>
                        <div className='col-span-1 flex flex-col gap-1'>
                            {name && <h1 className='text-lg font-semibold'>{name}</h1>}
                            {email && <p className='text-sm text-gray-600'>{email}</p>}
                            <label
                                htmlFor='profilePictureInput'
                                className='mt-4 w-full cursor-pointer whitespace-nowrap  rounded-md border border-gray-300 bg-transparent px-2 py-1 text-center text-xs'>
                                Change Profile Picture
                                <input id='profilePictureInput' type='file' className='hidden' onChange={handleProfilePictureChange} />
                            </label>
                            <p>JPG or PNG. 1MB max.</p>
                        </div>
                    </div>

                    <div className='mt-7 flex  list-none items-center gap-3 overflow-y-auto'>
                        {links.map(link => (
                            <Link
                                key={link.id}
                                href={link.path}
                                className={`flex w-fit  cursor-pointer items-center whitespace-nowrap text-sm sm:text-base sm:h-6 sm:px-4 sm:py-6 rounded-md ${
                                    pathName === link.path
                                        ? ' bg-primary p-2 text-white '
                                        : ' bg-white hover:bg-gray-100  '
                                }`}>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <hr />

                    {children}
                </BoxContainer>
            </div>

            <div className='  hidden lg:flex'>
                <div className='container mx-auto max-w-screen-lg px-2'>
                    <div>
                        <div className='mb-6 rounded bg-white p-4 px-4 md:p-8'>
                            <div className='grid grid-cols-1 gap-4 gap-y-2 text-sm lg:grid-cols-3'>
                                <div className='flex h-screen flex-col items-center text-gray-600'>
                                    <img
                                        src={image ? `${image}` : '/dummy_avatar.png'}
                                        alt=''
                                        className='relative inline-block h-[300px] w-[300px] rounded-sm object-cover object-center'
                                    />
                                    <label
                                        htmlFor='profilePictureInput'
                                        className='mt-4 w-full cursor-pointer  rounded-md border border-gray-300 bg-transparent px-2 py-1 text-center'>
                                        Change Profile Picture
                                        <input id='profilePictureInput' type='file' className='hidden' onChange={handleProfilePictureChange} />
                                    </label>
                                    <p className='text-sm mt-2'>JPG or PNG. 1MB max.</p>

                                    <div className='mt-10 w-full space-y-0'>
                                        <div className='w-full list-none space-y-3'>
                                            {links.map(link => (
                                                <Link
                                                    key={link.id}
                                                    href={link.path}
                                                    className={`flex w-full cursor-pointer items-center justify-center ${
                                                        pathName === link.path
                                                            ? 'h-6 rounded-md bg-primary px-4 py-6 text-white'
                                                            : 'h-6 rounded-md bg-white px-4 py-4 hover:bg-gray-100'
                                                    }`}>
                                                    {link.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className='mx-8 lg:col-span-2'>
                                    <h1 className='text-2xl font-bold  text-gray-600'>
                                        {pathName === '/profile' && 'Basic Profile'}
                                        {pathName === '/profile/driving-licence' && 'Driver Licence Verification'}
                                        {pathName === '/profile/change-password' && 'Change Password'}
                                        {pathName === '/profile/delete-account' && 'Delete Account'}
                                    </h1>
                                    <p className='mt-4 text-sm text-gray-700'>
                                        Your profile details remain confidential and will not be disclosed to any third parties. The host will access your
                                        information solely for the purposes of vehicle pickup, billing, and mailing. For additional details on customer data
                                        usage, Please refer to our{' '}
                                        <Link href='/privacy' className='font-bold text-primary'>
                                            Privacy Policy
                                        </Link>
                                    </p>

                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default layout;
