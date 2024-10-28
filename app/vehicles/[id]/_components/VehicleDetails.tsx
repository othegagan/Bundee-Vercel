'use client';

import EmblaCarousel from '@/components/ui/carousel/EmblaCarousel';
import Readmore from '@/components/ui/readmore';
import { sortImagesByIsPrimary, toTitleCase } from '@/lib/utils';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

interface VehicleDetailsProps {
    vehicleDetails: any;
    vehicleHostDetails: any;
    vehicleBusinessConstraints: any;
    wishlistButton: any;
}

export default function VehicleDetails({ vehicleDetails, vehicleBusinessConstraints, vehicleHostDetails, wishlistButton }: VehicleDetailsProps) {
    const mileageConstraints = vehicleBusinessConstraints.filter((constraint) => constraint.constraintName === 'MileageConstraint');
    const vehicleImages = sortImagesByIsPrimary(vehicleDetails?.imageresponse);

    return (
        <>
            {vehicleImages.length > 0 ? (
                <div className=' relative '>
                    <EmblaCarousel slides={vehicleImages} />
                    {wishlistButton}
                </div>
            ) : (
                <div className=' embla__slide max-h-80 overflow-hidden md:rounded-md'>
                    <img src='../images/image_not_available.png' alt='image_not_found' className='h-full w-full min-w-full object-cover md:rounded-md' />
                </div>
            )}

            <div className='container mt-4 space-y-4 md:px-0'>
                <VehicleMakeModelYear vehicleDetails={vehicleDetails} />

                <div className='space-y-6'>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
                        <Highlights vehicleDetails={vehicleDetails} />

                        <MileageConstraints mileageConstraints={mileageConstraints} />
                    </div>

                    {/* Description Section */}
                    <DetailSection title='Vehicle Description' content={vehicleDetails.desciption} />

                    {/* Parking Details Section */}
                    <DetailSection title='Parking Details' content={vehicleDetails.parkingDetails} />

                    {/* Additional Guidelines Section */}
                    <DetailSection title='Additional Guidelines' content={vehicleDetails.guideLines} />
                </div>

                {/* Hosted By Section */}
                <HostDetails hostDetails={vehicleHostDetails} />
            </div>
        </>
    );
}

function VehicleMakeModelYear({ vehicleDetails }: any) {
    const { make, model, year, rating, tripcount } = vehicleDetails;
    const fullName = `${toTitleCase(make)} ${model} ${year}`;
    const ratingText = rating ? rating.toFixed(1) : '1.0';
    const tripText = tripcount ? `${tripcount}  ${tripcount > 1 ? 'trips' : 'trip'}` : null;

    return (
        <div className='flex flex-col gap-4 md:flex-row md:gap-16'>
            <h2 className='text-[1.75rem capitalize tracking-tight'>{fullName}</h2>
            <div className='flex items-center gap-2'>
                <StarFilledIcon className='size-5 text-yellow-400' />
                <span className='text-base'>
                    {ratingText} ({tripText})
                </span>
            </div>
        </div>
    );
}

function HostDetails({ hostDetails }: any) {
    if (!hostDetails) {
        return null;
    }
    return (
        <div className='flex flex-col gap-2'>
            <p className='font-bold'>Hosted By</p>
            <div className='relative flex items-center gap-x-4'>
                <img
                    src={hostDetails.userimage || '/images/dummy_avatar.png'}
                    alt={hostDetails.firstname}
                    className='size-14 rounded-full border bg-neutral-50'
                />
                <div className='space-y-1'>
                    <p className='font-semibold text-neutral-900'>
                        {hostDetails.firstname} {hostDetails.lastname}
                    </p>
                    <p className='text-14 text-neutral-600'>Joined on {format(new Date(hostDetails.createddate), 'PP')}</p>
                </div>
            </div>
        </div>
    );
}

function MileageConstraints({ mileageConstraints }: any) {
    if (!mileageConstraints || mileageConstraints.length === 0) {
        return null;
    }
    return (
        <div className='space-y-3'>
            {mileageConstraints.some((mileageConstraint) => {
                const mileageConstraintData = JSON.parse(mileageConstraint.constraintValue);
                return mileageConstraintData.extraMileageCost > 0;
            }) && (
                <>
                    <p className='font-bold'>Mileage Limit</p>
                    <div className='flex flex-wrap gap-4'>
                        {mileageConstraints.map((mileageConstraint, index) => {
                            const mileageConstraintData = JSON.parse(mileageConstraint.constraintValue);
                            if (mileageConstraintData.extraMileageCost > 0) {
                                return (
                                    <div key={index} className='flex flex-wrap gap-4'>
                                        <div className='rounded-md bg-muted p-4'>
                                            <p className='mb-2 font-medium'>Daily Mileage Limit</p>
                                            <p className='font-bold text-sm'>{mileageConstraintData.mileageLimit} miles</p>
                                        </div>
                                        <div className='rounded-md bg-muted p-4'>
                                            <p className='mb-2 font-medium'>Additional Cost/Mile</p>
                                            <p className='font-bold text-sm'>${mileageConstraintData.extraMileageCost}</p>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

function Highlights({ vehicleDetails }: { vehicleDetails: any }) {
    const isValidDetail = (detail: any) => detail && !['Not Applicable', 'NA', 'N/A', 'null', null, '0', 0, ''].includes(detail);

    const highlights = [
        { key: 'trim', label: vehicleDetails.trim },
        { key: 'fueltypeprimary', label: vehicleDetails.fueltypeprimary },
        { key: 'bodyclass', label: vehicleDetails.bodyclass },
        { key: 'doors', label: isValidDetail(vehicleDetails.doors) ? `${vehicleDetails.doors} Doors` : null },
        { key: 'drivetype', label: vehicleDetails.drivetype },
        { key: 'wlectrificationlevel', label: vehicleDetails.wlectrificationlevel },
        { key: 'seatingCapacity', label: isValidDetail(vehicleDetails.seatingCapacity) ? `${vehicleDetails.seatingCapacity} Seats` : null }
    ];

    return (
        <div className='space-y-3'>
            <p className='font-bold'>Highlights</p>
            <ul className='list-disc space-y-2 pl-4 text-15'>
                {highlights
                    .filter((item) => isValidDetail(item.label)) // Only show valid details
                    .map((item, index) => (
                        <li key={index}>{item.label}</li>
                    ))}
            </ul>
        </div>
    );
}

function DetailSection({ title, content }: { title: string; content: any }) {
    if (!content) return null;
    return (
        <div className='space-y-3'>
            <p className='font-bold'>{title}</p>
            <Readmore text={content} />
        </div>
    );
}
