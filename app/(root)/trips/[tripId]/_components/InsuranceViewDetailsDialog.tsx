'use client';

import { Dialog, DialogBody } from '@/components/ui/dialog';
import { useInsuranceDetails } from '@/hooks/useDrivingProfile';
import { format } from 'date-fns';
import { useState } from 'react';

export default function InsuranceViewDetailsDialog() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    return (
        <>
            <button
                onClick={() => {
                    openModal();
                }}
                type='button'
                className='text-md underline underline-offset-2'>
                View Details
            </button>

            <Dialog isOpen={isModalOpen} openDialog={openModal} closeDialog={closeModal} title='Insurance Details'>
                <DialogBody className='lg:max-w-xl'>
                    <Content />
                </DialogBody>
                {/* <DialogFooter>
                    <Button type='button' variant='outline' onClick={closeModal} className='w-full sm:w-auto '>
                        OK
                    </Button>
                </DialogFooter> */}
            </Dialog>
        </>
    );
}

function Content() {
    const { data: response, isLoading, error } = useInsuranceDetails();

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    if (error || !response?.success) {
        return <div>{error?.message || 'Error fetching insurance details'}</div>;
    }

    const insuranceDetails = response.data?.insuranceDetails[0];

    if (!insuranceDetails) {
        return <div>Insurance Not verified</div>;
    }

    if (insuranceDetails.verifiedStatus === 'notVerified' || insuranceDetails.verifiedStatus === 'failed') {
        return <div>Insurance Not verified</div>;
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
