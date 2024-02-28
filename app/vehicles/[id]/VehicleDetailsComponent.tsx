import React from 'react';
import { format } from 'date-fns';
import Carousel from '@/components/ui/carousel/carousel';
import { StarFilledIcon } from '@radix-ui/react-icons';

const VehicleDetailsComponent = ({ vehicleDetails, vehicleImages, vehicleHostDetails, vehicleBusinessConstraints }) => {
    const mileageConstraints = vehicleBusinessConstraints.filter(constraint => constraint.constraintName === 'MileageConstraint');

    return (
        <div>
            {vehicleImages.length > 0 ? (
                <div className='sm:overflow-hidden rounded-lg '>
                    <Carousel autoSlide={false}>
                        {vehicleImages.map((s, i) => (
                            <img key={i} src={s.imagename} className='max-h-fit min-w-full' alt={`vehicle image ${i}`} />
                        ))}
                    </Carousel>
                </div>
            ) : (
                <div className='sm:overflow-hidden rounded-lg lg:aspect-video lg:h-44 mx-auto'>
                    <img
                        src='../image_not_available.png'
                        alt='image_not_found'
                        className='h-full w-full scale-[0.7] object-cover object-center transition-all ease-in-out  lg:h-full lg:w-full'
                    />
                </div>
            )}

            <div className='space-y-4 mt-10'>
                <div className='flex gap-4 flex-wrap'>
                    <h1 className='text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl'>
                        {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.year}
                    </h1>

                    <div className='flex items-center '>
                        <div className='flex items-center'>
                            <StarFilledIcon className='h-5 w-5 text-yellow-500' />
                            <span className='ml-2'>{vehicleDetails.rating.toFixed(1)}</span>
                        </div>
                        <p className='ml-3 text-sm font-medium text-primary hover:text-primary'>({vehicleDetails.tripcount} trips)</p>
                    </div>
                </div>

                <div className='space-y-6'>
                    {/* Highlight Section */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className='space-y-3'>
                            <p className='font-bold'>Highlights</p>

                            <ul role='list' className='list-disc space-y-2 pl-4 text-sm'>
                                {vehicleDetails.trim && vehicleDetails.trim !== 'Not Applicable' && vehicleDetails.trim !== 'NA' && (
                                    <li className='text-neutral-600'>{vehicleDetails.trim}</li>
                                )}

                                {vehicleDetails.fueltypeprimary && vehicleDetails.fueltypeprimary !== 'Not Applicable' && vehicleDetails.fueltypeprimary !== 'NA' && (
                                    <li className='text-neutral-600'>{vehicleDetails.fueltypeprimary}</li>
                                )}

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

                                {vehicleDetails.seatingCapacity && vehicleDetails.seatingCapacity !== 'Not Applicable' && vehicleDetails.seatingCapacity !== 'NA' && (
                                    <li className='text-neutral-600'>{vehicleDetails.seatingCapacity} Seats</li>
                                )}
                            </ul>
                        </div>

                        {/* Mileage constraints*/}
                        {mileageConstraints.length > 0 && (
                            <div className='space-y-3'>
                                {mileageConstraints.some(mileageConstraint => {
                                    const mileageConstraintData = JSON.parse(mileageConstraint.constraintValue);
                                    return mileageConstraintData.extraMileageCost > 0;
                                }) && (
                                    <React.Fragment>
                                        <p className='font-bold'>Mileage Limit</p>
                                        <div className='flex gap-4 flex-wrap'>
                                            {mileageConstraints.map((mileageConstraint, index) => {
                                                const mileageConstraintData = JSON.parse(mileageConstraint.constraintValue);
                                                if (mileageConstraintData.extraMileageCost > 0) {
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <div className='p-4 bg-neutral-100 rounded-md'>
                                                                <p className='font-medium text-sm mb-2'>Daily Mileage Limit</p>
                                                                <p className='font-bold text-sm'>{mileageConstraintData.mileageLimit} miles</p>
                                                            </div>
                                                            <div className='p-4 bg-neutral-100 rounded-md'>
                                                                <p className='font-medium text-sm mb-2'>Additional Cost / Mile</p>
                                                                <p className='font-bold text-sm'>$ {mileageConstraintData.extraMileageCost}</p>
                                                            </div>
                                                        </React.Fragment>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            })}
                                        </div>
                                    </React.Fragment>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Parking desciption Section */}
                    {vehicleDetails.desciption && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Vehicle Description</p>
                            <p className='text-base text-gray-900'>{vehicleDetails.desciption}</p>
                        </div>
                    )}

                    {/* Parking Details Section */}
                    {vehicleDetails.parkingDetails && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Parking Details</p>
                            <p className='text-base text-gray-900'>{vehicleDetails.parkingDetails}</p>
                        </div>
                    )}

                    {/* Additional Guidelines Section */}
                    {vehicleDetails.guideLines && (
                        <div className='space-y-3'>
                            <p className='font-bold'> Additional GuideLines</p>
                            <p className='text-base text-gray-900'>{vehicleDetails.guideLines}</p>
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
                                    src={`data:image/png;base64, ${vehicleHostDetails.userimage}`}
                                    alt={vehicleHostDetails.firstname}
                                    className='h-14 w-14 rounded-full bg-neutral-50'
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
