import Carousel from '@/components/ui/carousel/carousel';
import React from 'react';

const VehicleDetailsComponent = ({ car }: any) => {
    return (
        <>
            <div className='sm:overflow-hidden rounded-lg '>
                <Carousel autoSlide={true}>
                    {car?.imageresponse.map((s, i) => (
                        <img key={i} src={s.imagename} className='max-h-fit min-w-full' alt={`vehicle image ${i}`} />
                    ))}
                </Carousel>
            </div>

            <div className='space-y-4 mt-6'>
                <h1 className='text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl'>
                    {car.make} {car.model} {car.year}
                </h1>
                {/* <span className='text-xs'>{vehicleDetails.vin}</span> */}
                <p className='text-base text-neutral-700 max-w-3xl'>{car?.desciption}</p>

                <div className='space-y-6'>
                    <div className='spacey-3'>
                        <p className='font-bold'>Highlights</p>
                        <ul role='list' className='list-disc space-y-2 mt-3 pl-4 text-sm'>
                            {car?.trim && car?.trim !== 'Not Applicable' && car?.trim !== 'NA' && <li className='text-neutral-600'>{car?.trim}</li>}
                            {car?.vehicleType && car?.vehicleType !== 'Not Applicable' && car?.vehicleType !== 'NA' && <li className='text-neutral-600'>{car?.vehicleType}</li>}
                            {car?.bodyclass && car?.bodyclass !== 'Not Applicable' && car?.bodyclass !== 'NA' && <li className='text-neutral-600'>{car?.bodyclass}</li>}
                            {car?.doors && car?.doors !== 'Not Applicable' && car?.doors !== 'NA' && <li className='text-neutral-600'>{car?.doors} Doors</li>}
                            {car?.drivetype && car?.drivetype !== 'Not Applicable' && car?.drivetype !== 'NA' && <li className='text-neutral-600'>{car?.drivetype}</li>}
                            {car?.wlectrificationlevel && car?.wlectrificationlevel !== 'Not Applicable' && car?.wlectrificationlevel !== 'NA' && (
                                <li className='text-neutral-600'>{car?.wlectrificationlevel}</li>
                            )}
                            {car?.seatingCapacity && car?.seatingCapacity !== 'Not Applicable' && car?.seatingCapacity !== 'NA' && (
                                <li className='text-neutral-600'>{car?.seatingCapacity} Seats</li>
                            )}
                        </ul>
                    </div>

                    {car?.parkingDetails ? (
                        <div className='space-y-3'>
                            <p className='font-bold'>Parking Details</p>
                            <p className='text-base text-gray-900'>{car?.parkingDetails}</p>
                        </div>
                    ) : null}

                    {car?.guideLines ? (
                        <div className='space-y-3'>
                            <p className='font-bold'> Additional GuideLines</p>
                            <p className='text-base text-gray-900'>{car?.guideLines}</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default VehicleDetailsComponent;
