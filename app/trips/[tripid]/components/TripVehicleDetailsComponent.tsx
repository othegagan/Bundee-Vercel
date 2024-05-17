'use client';
import TripImageVideoCarousel from '@/app/trips/[tripid]/components/TripImageVideoCarousel';
import Carousel from '@/components/ui/carousel/carousel';
import React from 'react';

const TripVehicleDetailsComponent = ({ car, driverUploadedImages, hostUploadedImages }: any) => {
    const images: any = [...car?.imageresponse].sort((a, b) => {
        // Sort records with isPrimary true first
        if (a.isPrimary && !b.isPrimary) {
            return -1;
        } else if (!a.isPrimary && b.isPrimary) {
            return 1;
        } else {
            // For records with the same isPrimary value, maintain their original order
            return a.orderNumber - b.orderNumber;
        }
    });
    return (
        <>
            <div className='rounded-lg sm:overflow-hidden '>
                <Carousel autoSlide={false}>
                    {images.map((s, i) => (
                        <img key={i} src={s.imagename} className='max-h-fit min-w-full' alt={`vehicle image ${i}`} />
                    ))}
                </Carousel>
            </div>

            <div className='mt-6 space-y-4'>
                <h1 className='text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl'>
                    {car.make} {car.model} {car.year}
                </h1>
                {/* <span className='text-xs'>{vehicleDetails.vin}</span> */}
                <p className='max-w-3xl text-base text-neutral-700'>{car?.desciption}</p>

                <div className='space-y-6'>
                    <div className='spacey-3'>
                        <p className='font-bold'>Highlights</p>
                        <ul role='list' className='mt-3 list-disc space-y-2 pl-4 text-sm'>
                            {car?.trim && car?.trim !== 'Not Applicable' && car?.trim !== 'NA' && <li className='text-neutral-600'>{car?.trim}</li>}
                            {car?.vehicleType && car?.vehicleType !== 'Not Applicable' && car?.vehicleType !== 'NA' && (
                                <li className='text-neutral-600'>{car?.vehicleType}</li>
                            )}
                            {car?.bodyclass && car?.bodyclass !== 'Not Applicable' && car?.bodyclass !== 'NA' && (
                                <li className='text-neutral-600'>{car?.bodyclass}</li>
                            )}
                            {car?.doors && car?.doors !== 'Not Applicable' && car?.doors !== 'NA' && <li className='text-neutral-600'>{car?.doors} Doors</li>}
                            {car?.drivetype && car?.drivetype !== 'Not Applicable' && car?.drivetype !== 'NA' && (
                                <li className='text-neutral-600'>{car?.drivetype}</li>
                            )}
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

                    {driverUploadedImages.length > 0 ? (
                        <div className='space-y-3'>
                            <p className='font-bold'> Driver Uploaded Images</p>
                            <TripImageVideoCarousel uploadedBy='driver' images={driverUploadedImages} />
                        </div>
                    ) : null}

                    {hostUploadedImages.length > 0 ? (
                        <div className='space-y-3'>
                            <p className='font-bold'> Host Uploaded Images</p>
                            <TripImageVideoCarousel uploadedBy='host' images={hostUploadedImages} />
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};

export default TripVehicleDetailsComponent;
