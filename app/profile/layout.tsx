'use client';
import React, { useEffect, useState } from 'react';
import { updateExistUser } from '../_actions/update_profile';
import { toast } from '@/components/ui/use-toast';
import { fetchProfileDetails } from '../_actions/fetchprofiledetails';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const layout = ({ children }: { children: React.ReactNode }) => {
    const pathName = usePathname();
    const [image, setImage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payload = {
                    iduser: localStorage.getItem('userId'),
                };
                const token = localStorage.getItem('bundee_auth_token');

                const data: any = await fetchProfileDetails(payload, token);
                setImage(data.userImage);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, []);

    const handleProfilePictureChange = async event => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 1048576) {
                toast({
                    duration: 4000,
                    className: 'bg-red-400 text-white',
                    title: 'Image size exceeded to 1MB',
                    description: 'Please select an image size less than 1 MB.',
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                const resultAsString = reader.result as string;
                setImage(resultAsString);

                localStorage.setItem('profilePicture', resultAsString);

                const bundeeToken = localStorage.getItem('bundee_auth_token');

                const body = {
                    iduser: localStorage.getItem('userId'),
                };
                try {
                    const data = await fetchProfileDetails(body, bundeeToken);
                    const payload = {
                        iduser: data.iduser,
                        firstname: data.firstName,
                        middlename: '',
                        lastname: data.lastName,
                        mobilePhone: data.phoneNumber,
                        address_1: data.address1,
                        address_2: data.address2,
                        address_3: data.address3,
                        city: data.city,
                        state: data.state,
                        postcode: data.postCode,
                        country: 'United',
                        language: 'NA',
                        driverlisense: 'NA',
                        vehicleowner: false,
                        fromValue: 'completeProfile',
                        userimage: resultAsString,
                    };

                    await updateExistUser(payload, bundeeToken)
                        .then(res => {
                            toast({
                                duration: 3000,
                                className: 'bg-green-400 text-white',
                                title: 'Profile photo updated successful.',
                                description: 'Your profile photo has been updated successfully.',
                            });
                        })
                        .catch(err => {});
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
            <div className='min-h-screen  flex'>
                <div className='container max-w-screen-lg mx-auto'>
                    <div>
                        <div className='bg-white rounded p-4 px-4 md:p-8 mb-6'>
                            <div className='grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3'>
                                <div className='flex flex-col items-center h-screen text-gray-600'>
                                    <img
                                        src={image ? `${image}` : '/profile_avatar.png'}
                                        alt=''
                                        className='relative inline-block h-[300px] w-[300px] rounded-sm object-cover object-center'
                                    />
                                    <label
                                        htmlFor='profilePictureInput'
                                        className='text-center mt-4 bg-transparent  border border-gray-300 py-1 px-2 rounded-md cursor-pointer w-full'>
                                        Change Profile Picture
                                        <input id='profilePictureInput' type='file' className='hidden' onChange={handleProfilePictureChange} />
                                    </label>

                                    <div className='space-y-0 mt-10 w-full'>
                                        <div className='space-y-3 list-none w-full'>
                                            {links.map(link => (
                                                <Link
                                                    key={link.id}
                                                    href={link.path}
                                                    className={`cursor-pointer flex justify-center items-center w-full ${
                                                        pathName === link.path
                                                            ? 'bg-primary text-white rounded-md px-4 h-6 py-6'
                                                            : 'bg-white rounded-md px-4 py-4 h-6 hover:bg-gray-100'
                                                    }`}>
                                                    {link.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className='lg:col-span-2 mx-8'>
                                    <h1 className='text-2xl font-bold  text-gray-600'>
                                        {pathName === '/profile' && 'Basic Profile'}
                                        {pathName === '/profile/driving-licence' && 'Driver Licence Verification'}
                                        {pathName === '/profile/change-password' && 'Change Password'}
                                        {pathName === '/profile/delete-account' && 'Delete Account'}
                                    </h1>
                                    <p className='mt-4 text-gray-700 text-sm'>
                                        Your profile details remain confidential and will not be disclosed to any third parties. The host will access your information solely for
                                        the purposes of vehicle pickup, billing, and mailing. For additional details on customer data usage, Please refer to our{' '}
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
