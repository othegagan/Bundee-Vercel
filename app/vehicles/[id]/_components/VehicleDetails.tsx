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
                <div className=' max-h-56 md:max-h-80 relative'>
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
                    <div className='grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2'>
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
    const ratingText = rating ? rating.toFixed(1) : 'Not Rated';
    const tripText = tripcount ? `${tripcount} Trips` : 'No Trips';

    return (
        <div className='flex gap-4 flex-col md:flex-row md:gap-16'>
            <h2 className='tracking-tight capitalize'>{fullName}</h2>
            <div className='flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                    <StarFilledIcon className='size-6 text-yellow-400' />
                    <span className='text-base'>{ratingText}</span>
                </div>
                <p>.</p>
                <p className='text-base'>({tripText})</p>
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
            <div className='relative  flex items-center gap-x-4'>
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
                                            <p className='mb-2  font-medium'>Daily Mileage Limit</p>
                                            <p className='text-sm font-bold'>{mileageConstraintData.mileageLimit} miles</p>
                                        </div>
                                        <div className='rounded-md bg-muted p-4'>
                                            <p className='mb-2  font-medium'>Additional Cost/Mile</p>
                                            <p className='text-sm font-bold'>${mileageConstraintData.extraMileageCost}</p>
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

function Highlights({ vehicleDetails }: any) {
    const isValidDetail = (detail: any) => detail && detail !== 'Not Applicable' && detail !== 'NA';

    const highlights = [
        { key: 'trim', label: vehicleDetails.trim },
        { key: 'fueltypeprimary', label: vehicleDetails.fueltypeprimary },
        { key: 'bodyclass', label: vehicleDetails.bodyclass },
        { key: 'doors', label: `${vehicleDetails.doors} Doors` },
        { key: 'drivetype', label: vehicleDetails.drivetype },
        { key: 'wlectrificationlevel', label: vehicleDetails.wlectrificationlevel },
        { key: 'seatingCapacity', label: `${vehicleDetails.seatingCapacity} Seats` }
    ];

    return (
        <div className='space-y-3'>
            <p className='font-bold'>Highlights</p>
            <ul className='text-15 list-disc space-y-2 pl-4'>
                {highlights
                    .filter((item) => isValidDetail(item.label))
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