'use client';

import ErrorComponent from '@/components/custom/ErrorComponent';
import { Button } from '@/components/ui/button';
import { useGenerateInsuranceVerificationLink, useInsuranceDetails } from '@/hooks/useDrivingProfile';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InsurancePage() {
    const { data: response, isLoading, error } = useInsuranceDetails();

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    if (error || !response?.success) {
        return <ErrorComponent message={error?.message || 'Error fetching insurance details'} />;
    }

    const insuranceDetails = response.data?.insuranceDetails[0];

    if (!insuranceDetails) {
        return <NotVerifiedDetails />;
    }

    if (insuranceDetails.verifiedStatus.toLowerCase() === 'notverified' || insuranceDetails.verifiedStatus.toLowerCase() === 'failed') {
        return <NotVerifiedDetails />;
    }

    if (insuranceDetails.verifiedStatus.toLowerCase() === 'inprogress') {
        return <InProgressDetails />;
    }

    return <VerifiedDetails insuranceDetails={insuranceDetails} />;
}

const Field = ({ label, children }: { label: string; children: any }) => (
    <div className='flex flex-col px-2 py-1 sm:px-0'>
        <dt className='font-semibold text-neutral-900 leading-6'>{label}</dt>
        <dd className='mt-1 text-neutral-700 text-sm leading-6 sm:col-span-2 sm:mt-0'>{children}</dd>
    </div>
);

function VerifiedDetails({ insuranceDetails }: { insuranceDetails }) {
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
        <div className='flex flex-col gap-6'>
            <h2 className='font-bold text-xl'>Confirm Insurance Details</h2>
            <p>We've found the following insurance information. Please confirm if this information is correct.</p>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6'>
                <Field label='Insurance Carrier'>{insuranceDetails.insuranceProvider.name}</Field>
                <Field label='Policy Number'>{insuranceDetails.policyNumber}</Field>
                <Field label='Policy Validity'>
                    {' '}
                    {format(insuranceDetails.startDate, 'PP')} - {format(insuranceDetails.expiryDate, 'PP')}
                </Field>
            </div>
            <div className='mt-10 flex flex-col gap-5'>
                <Link href='/checkout/summary' className='w-full'>
                    <Button className='w-full'> Confirm Insurance Details</Button>
                </Link>
                <Button type='button' variant='outline' onClick={handleReVerify} disabled={isGeneratingLink}>
                    {isGeneratingLink ? 'Generating Link...' : 'Re-Verify Insurance'}
                </Button>
            </div>
        </div>
    );
}

function InProgressDetails() {
    return (
        <div className='flex flex-col gap-6'>
            <h2 className='font-bold text-xl'>Insurance Details</h2>
            <p>We've found your insurance information is under verification. Please countinue.</p>

            <div className='mt-10 flex flex-col gap-5'>
                <Link href='/checkout/summary' className='w-full'>
                    <Button className='w-full'> Countinue</Button>
                </Link>
            </div>
        </div>
    );
}

function NotVerifiedDetails() {
    const { refetch: generateLink, data: linkResponse, isLoading: isGeneratingLink, error: linkError } = useGenerateInsuranceVerificationLink();

    const handleReVerify = async () => {
        try {
            const result = await generateLink();
            console.log(result);
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
        <div className='flex flex-col gap-6'>
            <h2 className='font-bold text-xl'>
                Verify Insurance Details <span className='font-medium text-md text-muted-foreground'>(Optional)</span>
            </h2>
            <p>You can choose to verify your insurance now. If you choose to skip now, you will be reminded before your trip starts.</p>

            <div className='mt-10 flex flex-col gap-5'>
                <Button type='button' onClick={handleReVerify} disabled={isGeneratingLink}>
                    {isGeneratingLink ? 'Generating Link...' : 'Verify Insurance'}
                </Button>

                <Link href='/checkout/summary' className='w-full'>
                    <Button className='w-full' variant='outline'>
                        I don't have insurance
                    </Button>
                </Link>

                <Link href='/checkout/summary' className='w-full'>
                    <Button className='w-full' variant='ghost'>
                        Skip for Now
                    </Button>
                </Link>
            </div>
        </div>
    );
}
