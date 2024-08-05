import EmblaCarousel from '@/components/ui/carousel/EmblaCarousel';
import Readmore from '@/components/ui/readmore';
import { toTitleCase } from '@/lib/utils';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import React from 'react';

const VehicleDetailsComponent = ({ vehicleDetails, vehicleImages, vehicleHostDetails, vehicleBusinessConstraints, wishlistButton }) => {
    const mileageConstraints = vehicleBusinessConstraints.filter((constraint) => constraint.constraintName === 'MileageConstraint');

    return (
        <div>
            {vehicleImages.length > 0 ? (
                <div className='relative sm:overflow-hidden md:rounded-lg '>
                    <EmblaCarousel slides={vehicleImages} />
                    {wishlistButton}
                </div>
            ) : (
                <div className=' embla__slide max-h-80 overflow-hidden md:rounded-md'>
                    <img src='../images/image_not_available.png' alt='image_not_found' className='h-full w-full min-w-full object-cover md:rounded-md' />
                </div>
            )}

            <div className='container mt-4 space-y-4 md:px-0'>
                <h2 className='tracking-tight'>
                    {toTitleCase(vehicleDetails.make)} {vehicleDetails.model} {vehicleDetails.year}
                </h2>
                <div className='flex items-center gap-2 '>
                    <div className='flex items-center gap-2'>
                        <StarFilledIcon className='size-5 text-yellow-400 md:size-4' />
                        <span className='text-15'>{vehicleDetails.rating.toFixed(1)}</span>
                    </div>
                    <p>.</p>
                    <p className=' text-15 '>({vehicleDetails.tripcount} Trips)</p>
                </div>

                <div className='space-y-6'>
                    {/* Highlight Section */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='space-y-3'>
                            <p className='font-bold'>Highlights</p>

                            <ul className='text-15 list-disc space-y-2 pl-4'>
                                {vehicleDetails.trim && vehicleDetails.trim !== 'Not Applicable' && vehicleDetails.trim !== 'NA' && (
                                    <li>{vehicleDetails.trim}</li>
                                )}

                                {vehicleDetails.fueltypeprimary &&
                                    vehicleDetails.fueltypeprimary !== 'Not Applicable' &&
                                    vehicleDetails.fueltypeprimary !== 'NA' && <li>{vehicleDetails.fueltypeprimary}</li>}

                                {vehicleDetails.bodyclass && vehicleDetails.bodyclass !== 'Not Applicable' && vehicleDetails.bodyclass !== 'NA' && (
                                    <li>{vehicleDetails.bodyclass}</li>
                                )}

                                {vehicleDetails.doors && vehicleDetails.doors !== 'Not Applicable' && vehicleDetails.doors !== 'NA' && (
                                    <li>{vehicleDetails.doors} Doors</li>
                                )}

                                {vehicleDetails.drivetype && vehicleDetails.drivetype !== 'Not Applicable' && vehicleDetails.drivetype !== 'NA' && (
                                    <li>{vehicleDetails.drivetype}</li>
                                )}

                                {vehicleDetails.wlectrificationlevel &&
                                    vehicleDetails.wlectrificationlevel !== 'Not Applicable' &&
                                    vehicleDetails.wlectrificationlevel !== 'NA' && <li>{vehicleDetails.wlectrificationlevel}</li>}

                                {vehicleDetails.seatingCapacity &&
                                    vehicleDetails.seatingCapacity !== 'Not Applicable' &&
                                    vehicleDetails.seatingCapacity !== 'NA' && <li>{vehicleDetails.seatingCapacity} Seats</li>}
                            </ul>
                        </div>

                        {/* Mileage constraints*/}
                        {mileageConstraints.length > 0 && (
                            <div className='space-y-3'>
                                {mileageConstraints.some((mileageConstraint) => {
                                    const mileageConstraintData = JSON.parse(mileageConstraint.constraintValue);
                                    return mileageConstraintData.extraMileageCost > 0;
                                }) && (
                                    <div>
                                        <p className='font-bold'>Mileage Limit</p>
                                        <div className='flex flex-wrap gap-4'>
                                            {mileageConstraints.map((mileageConstraint, index) => {
                                                const mileageConstraintData = JSON.parse(mileageConstraint.constraintValue);
                                                if (mileageConstraintData.extraMileageCost > 0) {
                                                    return (
                                                        <div key={index} className='flex flex-wrap gap-4'>
                                                            <div className='rounded-md bg-neutral-100 p-4'>
                                                                <p className='mb-2  font-medium'>Daily Mileage Limit</p>
                                                                <p className='text-sm font-bold'>{mileageConstraintData.mileageLimit} miles</p>
                                                            </div>
                                                            <div className='rounded-md bg-neutral-100 p-4'>
                                                                <p className='mb-2  font-medium'>Additional Cost / Mile</p>
                                                                <p className='text-sm font-bold'>${mileageConstraintData.extraMileageCost}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/*  desciption Section */}
                    {vehicleDetails.desciption && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Vehicle Description</p>
                            <Readmore text={vehicleDetails.desciption} />
                        </div>
                    )}

                    {/* Parking Details Section */}
                    {vehicleDetails.parkingDetails && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Parking Details</p>
                            <Readmore text={vehicleDetails.parkingDetails} />
                        </div>
                    )}

                    {/* Additional Guidelines Section */}
                    {vehicleDetails.guideLines && (
                        <div className='space-y-3'>
                            <p className='font-bold'> Additional GuideLines</p>
                            <Readmore text={vehicleDetails.guideLines} />
                        </div>
                    )}
                </div>

                {/* Hosted By Section */}
                {vehicleHostDetails && (
                    <div className='flex flex-col gap-2'>
                        <p className='font-bold'>Hosted By</p>
                        <div className='relative  flex items-center gap-x-4'>
                            <img
                                src={vehicleHostDetails.userimage || '/images/dummy_avatar.png'}
                                alt={vehicleHostDetails.firstname}
                                className='size-14 rounded-full border bg-neutral-50'
                            />
                            <div className='space-y-1'>
                                <p className='font-semibold text-neutral-900'>
                                    {vehicleHostDetails.firstname} {vehicleHostDetails.lastname}
                                </p>
                                <p className='text-14 text-neutral-600'>Joined on {format(new Date(vehicleHostDetails.createddate), 'PP')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleDetailsComponent;
