'use client';

import { DrivingLicenceDetailsSkeleton } from '@/components/skeletons/skeletons';
import { Button } from '@/components/ui/button';
import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import { useVerifiedDrivingProfile } from '@/hooks/useDrivingProfile';

const DrivingLicenceComponent = () => {
    const { data: response, isLoading, error } = useVerifiedDrivingProfile();

    if (isLoading) {
        return <DrivingLicenceDetailsSkeleton />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const { isDrivingProfileVerified, verifiedDetails } = response || {};

    if (!isDrivingProfileVerified || !verifiedDetails) {
        return <UnverifiedComponent />;
    }

    const { images, scores, personalInfo } = verifiedDetails;

    return <VerifiedDetailsComponent personalInfo={personalInfo} images={images} scores={scores} />;
};

export default DrivingLicenceComponent;

function VerifiedDetailsComponent({ personalInfo, images , scores}) {
    const drivingLicenseDialog = useDrivingLicenceDialog();

    return (
        <div>
            <p className='mt-4 max-w-2xl text-sm leading-snug text-neutral-500'>
                Your driving license details are verified. <br /> Please make sure that the details are correct. If not, please update them.
            </p>
            <div className='mt-6 border-t border-neutral-100'>
                <dl className='divide-y divide-neutral-100'>
                    <Field label='Full name'>{personalInfo.fullName}</Field>
                    <Field label='Date of Birth'>{personalInfo.dob}</Field>
                    <Field label='Address'>{personalInfo.fullAddress}</Field>
                    <Field label='Driving Licence Number'>{personalInfo.drivingLicenceNumber}</Field>
                    <Field label='Expires on'>{personalInfo.expires}</Field>
                    <dd className='flex flex-col gap-4 pt-4 text-sm text-neutral-900 sm:col-span-2  sm:flex-row'>
                        <Attachment photoUrl={images.selfie} altText='Driver photo' description='Driver Selfie' />
                        <Attachment photoUrl={images.front} altText='Driving Licence Front photo' description='Driving License Front photo' />
                        <Attachment photoUrl={images.back} altText='Driving Licence Back photo' description='Driving License Back photo' />
                    </dd>
                </dl>
            </div>

            <div className='mt-6 flex justify-end'>
                <Button
                    type='button'
                    variant='black'
                    onClick={() => {
                        drivingLicenseDialog.isUpdate = true;
                        drivingLicenseDialog.onOpen();
                    }}>
                    Update Driving License
                </Button>
            </div>
        </div>
    );
}

function UnverifiedComponent() {
    const drivingLicenseDialog = useDrivingLicenceDialog();
    return (
        <div className='mt-12 flex flex-col gap-3'>
            <p className='mt-4 max-w-2xl text-sm leading-snug text-neutral-500'>Your driving license has not yet been verified. Please verify it.</p>
            <div className='mt-6 flex justify-end'>
                <Button
                    type='button'
                    variant='black'
                    onClick={() => {
                        drivingLicenseDialog.isUpdate = false;
                        drivingLicenseDialog.onOpen();
                    }}>
                    Verify Driving License
                </Button>
            </div>
        </div>
    );
}

const Attachment = ({ photoUrl, altText, description }) => (
    <div className='flex flex-col gap-1 md:w-[40%]'>
        <div className='aspect-h-1 aspect-w-1 lg:aspect-none w-full overflow-hidden rounded-md bg-gray-200 lg:h-32 lg:w-[200px] '>
            <img src={`data:image/jpeg;base64,${photoUrl}`} alt={altText} className='h-full w-full object-cover objectbg-center' />
        </div>
        <p className='text-center text-[12px]'>{description}</p>
    </div>
);

const Field = ({ label, children }: { label: string; children: any }) => (
    <div className='px-2 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
        <dt className='text-sm font-medium leading-6 text-neutral-900'>{label}</dt>
        <dd className='mt-1 text-sm leading-6 text-neutral-700 sm:col-span-2 sm:mt-0'>{children}</dd>
    </div>
);
