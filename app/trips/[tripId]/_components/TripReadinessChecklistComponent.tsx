'use client';

import { RxQuestionMarkCircled } from 'react-icons/rx';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import DocumentHandlerComponent from './DocumentHandlerComponent';

export default function TripReadinessChecklistComponent({ trip }: any) {
    return (
        <div className='flex flex-col gap-2'>
            <div className='text-md font-bold '>Readiness Checklist</div>

            {/* Driving Licence */}
            <div className='flex items-center justify-between'>
                <div className='text-md w-fit flex-center gap-2'>
                    <RxQuestionMarkCircled className='text-yellow-500 size-5' /> Driving Licence
                </div>
                <div className='text-md  underline underline-offset-2'> Upload</div>
            </div>

            {/* Insurance */}
            <div className='flex items-center justify-between'>
                <div className='text-md w-fit flex-center gap-2'>
                    <IoCheckmarkCircleOutline className='text-green-500 size-5' />
                    Insurance
                </div>
                <div className='text-md  underline underline-offset-2'> Change</div>
            </div>

            {/* Rental Agreement */}
            <div className='flex items-center justify-between'>
                <div className='text-md w-fit flex-center gap-2'>
                    <IoCheckmarkCircleOutline className='text-green-500 size-5' />
                    Rental Agreement
                </div>
                {!trip.isRentalAgreed && ['cancelled', 'completed', 'rejected', 'cancellation requested'].indexOf(trip.status.toLowerCase()) === -1 && (
                    <DocumentHandlerComponent
                        isRentalAgreed={trip.isRentalAgreed}
                        tripId={trip.tripid}
                        rentalAgrrementUrl={trip.rentalAgrrementUrl}
                        rentalAgreedDate={trip.rentalAgreedDate}
                    />
                )}
                {trip.isRentalAgreed && (
                    <DocumentHandlerComponent
                        isRentalAgreed={trip.isRentalAgreed}
                        tripId={trip.tripid}
                        rentalAgrrementUrl={trip.rentalAgrrementUrl}
                        rentalAgreedDate={trip.rentalAgreedDate}
                    />
                )}
            </div>

            {/* Phone Number */}
            <div className='flex items-center justify-between'>
                <div className='text-md w-fit flex-center gap-2'>
                    <IoCheckmarkCircleOutline className='text-green-500 size-5' />
                    Phone Number
                </div>
                <div className='text-md  underline underline-offset-2'> Verify</div>
            </div>
        </div>
    );
}
