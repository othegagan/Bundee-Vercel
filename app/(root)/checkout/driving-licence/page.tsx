'use client';

import { CheckoutDrivingLicenceSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import { useVerifiedDrivingProfile } from '@/hooks/useDrivingProfile';
import Link from 'next/link';

export default function DrivingLicensePage() {
    const { data: response, isLoading, error } = useVerifiedDrivingProfile();

    const drivingLicenseDialog = useDrivingLicenceDialog();

    if (isLoading) {
        return <CheckoutDrivingLicenceSkeleton />;
    }

    const { isDrivingProfileVerified, verifiedDetails } = response || {};

    // Driving licence not verified
    if (!isDrivingProfileVerified || !verifiedDetails) {
        return (
            <div className='flex flex-col gap-6'>
                <h2 className='font-bold text-xl'>Verify Driver&apos;s Licence</h2>

                <p>
                    Please upload your Driver’s License so that we can verify it. If you choose to skip this step, please note that your reservation cannot be
                    approved, and we cannot guarantee that your car will be available at the date/time requested.
                </p>
                <div className='mt-10 flex flex-col gap-5'>
                    <Link href='/driving_licence_verification' className='w-full'>
                        <Button className='w-full'> Verify Driver&apos;s Licence </Button>
                    </Link>
                    <Link href='/checkout/insurance' className='w-full'>
                        <Button className='w-full' variant='outline'>
                            Skip for Now
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const { personalInfo } = verifiedDetails;

    // Driving licence verified
    return (
        <div className='flex flex-col gap-6'>
            <h2 className='font-bold text-xl'>Confirm Driver&apos;s Licence</h2>
            <p>
                We've found the following license information. Please confirm if this information is correct. If any information is incorrect, please re-verify.
            </p>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6'>
                <Field label='Driving Licence Number'>{personalInfo.drivingLicenceNumber}</Field>
                <Field label='Expires on'>{personalInfo.expires}</Field>
                <Field label='Full name'>{personalInfo.fullName}</Field>
            </div>
            <div className='mt-10 flex flex-col gap-5'>
                <Link href='/checkout/insurance' className='w-full'>
                    <Button className='w-full'> Confirm Driver&apos;s Licence </Button>
                </Link>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                        drivingLicenseDialog.isUpdate = true;
                        drivingLicenseDialog.onOpen();
                    }}>
                    Re-Verify
                </Button>
            </div>
        </div>
    );
}

const Field = ({ label, children }: { label: string; children: any }) => (
    <div className='flex flex-col px-2 py-1 sm:px-0'>
        <dt className='font-semibold text-neutral-900 text-sm leading-6'>{label}</dt>
        <dd className='mt-1 text-neutral-700 text-sm leading-6 sm:col-span-2 sm:mt-0'>{children}</dd>
    </div>
);