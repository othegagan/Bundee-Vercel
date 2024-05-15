import React from 'react';
import { format } from 'date-fns';
import Carousel from '@/components/ui/carousel/carousel';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { toTitleCase } from '@/lib/utils';

const VehicleDetailsComponent = ({ vehicleDetails, vehicleImages, vehicleHostDetails, vehicleBusinessConstraints }) => {
    const mileageConstraints = vehicleBusinessConstraints.filter(constraint => constraint.constraintName === 'MileageConstraint');

    return (
        <div>
            {vehicleImages.length > 0 ? (
                <div className='rounded-lg sm:overflow-hidden '>
                    <Carousel autoSlide={false}>
                        {vehicleImages.map((s, i) => (
                            <img key={i} src={s.imagename} className='max-h-fit min-w-full object-cover' alt={`vehicle image ${i}`} />
                        ))}
                    </Carousel>
                </div>
            ) : (
                <div className='mx-auto rounded-lg sm:overflow-hidden lg:aspect-video lg:h-44'>
                    <img
                        src='../image_not_available.png'
                        alt='image_not_found'
                        className='h-full w-full scale-[0.7] object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full'
                    />
                </div>
            )}

            <div className='mt-10 space-y-4'>
                <div className='flex flex-wrap gap-4'>
                    <h1 className='text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl'>
                        {toTitleCase(vehicleDetails.make)} {vehicleDetails.model} {vehicleDetails.year}
                    </h1>

                    <div className='flex items-center '>
                        <div className='flex items-center'>
                            <StarFilledIcon className='h-5 w-5 text-yellow-400' />
                            <span className='ml-2'>{vehicleDetails.rating.toFixed(1)}</span>
                        </div>
                        <p className='ml-3 text-sm font-medium text-primary hover:text-primary'>({vehicleDetails.tripcount} trips)</p>
                    </div>
                </div>

                <div className='space-y-6'>
                    {/* Highlight Section */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='space-y-3'>
                            <p className='font-bold'>Highlights</p>

                            <ul role='list' className='list-disc space-y-2 pl-4 text-base'>
                                {vehicleDetails.trim && vehicleDetails.trim !== 'Not Applicable' && vehicleDetails.trim !== 'NA' && (
                                    <li className='text-neutral-600'>{vehicleDetails.trim}</li>
                                )}

                                {vehicleDetails.fueltypeprimary &&
                                    vehicleDetails.fueltypeprimary !== 'Not Applicable' &&
                                    vehicleDetails.fueltypeprimary !== 'NA' && <li className='text-neutral-600'>{vehicleDetails.fueltypeprimary}</li>}

                                {vehicleDetails.bodyclass && vehicleDetails.bodyclass !== 'Not Applicable' && vehicleDetails.bodyclass !== 'NA' && (
                                    <li className='text-neutral-600'>{vehicleDetails.bodyclass}</li>
                                )}

                                {vehicleDetails.doors && vehicleDetails.doors !== 'Not Applicable' && vehicleDetails.doors !== 'NA' && (
                                    <li className='text-neutral-600'>{vehicleDetails.doors} Doors</li>
                                )}

                                {vehicleDetails.drivetype && vehicleDetails.drivetype !== 'Not Applicable' && vehicleDetails.drivetype !== 'NA' && (
                                    <li className='text-neutral-600'>{vehicleDetails.drivetype}</li>
                                )}

                                {vehicleDetails.wlectrificationlevel &&
                                    vehicleDetails.wlectrificationlevel !== 'Not Applicable' &&
                                    vehicleDetails.wlectrificationlevel !== 'NA' && <li className='text-neutral-600'>{vehicleDetails.wlectrificationlevel}</li>}

                                {vehicleDetails.seatingCapacity &&
                                    vehicleDetails.seatingCapacity !== 'Not Applicable' &&
                                    vehicleDetails.seatingCapacity !== 'NA' && <li className='text-neutral-600'>{vehicleDetails.seatingCapacity} Seats</li>}
                            </ul>
                        </div>

                        {/* Mileage constraints*/}
                        {mileageConstraints.length > 0 && (
                            <div className='space-y-3'>
                                {mileageConstraints.some(mileageConstraint => {
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
                                                        <div key={index}>
                                                            <div className='rounded-md bg-neutral-100 p-4'>
                                                                <p className='mb-2 text-sm font-medium'>Daily Mileage Limit</p>
                                                                <p className='text-sm font-bold'>{mileageConstraintData.mileageLimit} miles</p>
                                                            </div>
                                                            <div className='rounded-md bg-neutral-100 p-4'>
                                                                <p className='mb-2 text-sm font-medium'>Additional Cost / Mile</p>
                                                                <p className='text-sm font-bold'>$ {mileageConstraintData.extraMileageCost}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Parking desciption Section */}
                    {vehicleDetails.desciption && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Vehicle Description</p>
                            <pre className=' font-inter text-wrap bg-transparent text-base  text-gray-900 '>{vehicleDetails.desciption}</pre>
                        </div>
                    )}

                    {/* Parking Details Section */}
                    {vehicleDetails.parkingDetails && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Parking Details</p>
                            <pre className=' font-inter text-wrap bg-transparent text-base  text-gray-900 '>{vehicleDetails.parkingDetails}</pre>
                        </div>
                    )}

                    {/* Additional Guidelines Section */}
                    {vehicleDetails.guideLines && (
                        <div className='space-y-3'>
                            <p className='font-bold'> Additional GuideLines</p>
                            <pre className=' font-inter text-wrap bg-transparent text-base  text-gray-900 '>{vehicleDetails.guideLines}</pre>
                        </div>
                    )}
                </div>

                {/* Hosted By Section */}
                {vehicleHostDetails && (
                    <div className='flex flex-col gap-2'>
                        <p className='font-bold'>Hosted By</p>
                        <div className='relative  flex items-center gap-x-4'>
                            {vehicleHostDetails?.userimage && (
                                <img
                                    src={`${vehicleHostDetails.userimage}`}
                                    alt={vehicleHostDetails.firstname}
                                    className='size-14 rounded-full border bg-neutral-50'
                                />
                            )}
                            <div className='text-sm leading-6'>
                                <p className='font-semibold text-neutral-900'>
                                    {vehicleHostDetails.firstname} {vehicleHostDetails.lastname}
                                </p>
                                <p className='text-neutral-600'>Joined on {format(new Date(vehicleHostDetails.createddate), 'PP')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleDetailsComponent;
