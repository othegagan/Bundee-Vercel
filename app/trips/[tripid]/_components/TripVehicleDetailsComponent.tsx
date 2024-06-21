'use client';

import EmblaCarousel from '@/components/ui/carousel/EmblaCarousel';
import Readmore from '@/components/ui/readmore';
import TripImageVideoCarousel from './TripImageVideoCarousel';

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
            {images.length > 0 ? (
                <div className='relative sm:overflow-hidden md:rounded-lg '>
                    <EmblaCarousel slides={images} />
                </div>
            ) : (
                <div className=' embla__slide max-h-80 overflow-hidden md:rounded-md'>
                    <img src='../image_not_available.png' alt='image_not_found' className='h-full w-full min-w-full object-cover md:rounded-md' />
                </div>
            )}

            <div className='mt-6 space-y-4'>
                <h2 className='tracking-tight'>
                    {car.make} {car.model} {car.year}
                </h2>

                <div className='space-y-6'>
                    <div className='space-y-3'>
                        <p className='font-bold'>Highlights</p>
                        <ul role='list' className='text-15 list-disc space-y-2 pl-4'>
                            {car?.trim && car?.trim !== 'Not Applicable' && car?.trim !== 'NA' && <li>{car?.trim}</li>}

                            {car?.fueltypeprimary && car?.fueltypeprimary !== 'Not Applicable' && car?.fueltypeprimary !== 'NA' && (
                                <li>{car?.fueltypeprimary}</li>
                            )}

                            {car?.bodyclass && car?.bodyclass !== 'Not Applicable' && car?.bodyclass !== 'NA' && <li>{car?.bodyclass}</li>}

                            {car?.doors && car?.doors !== 'Not Applicable' && car?.doors !== 'NA' && <li>{car?.doors} Doors</li>}

                            {car?.drivetype && car?.drivetype !== 'Not Applicable' && car?.drivetype !== 'NA' && <li>{car?.drivetype}</li>}

                            {car?.wlectrificationlevel && car?.wlectrificationlevel !== 'Not Applicable' && car?.wlectrificationlevel !== 'NA' && (
                                <li>{car?.wlectrificationlevel}</li>
                            )}

                            {car?.seatingCapacity && car?.seatingCapacity !== 'Not Applicable' && car?.seatingCapacity !== 'NA' && (
                                <li>{car?.seatingCapacity} Seats</li>
                            )}
                        </ul>
                    </div>

                    {/*  desciption Section */}
                    {car?.desciption && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Vehicle Description</p>
                            <Readmore text={car.desciption} />
                        </div>
                    )}

                    {car?.parkingDetails && (
                        <div className='space-y-3'>
                            <p className='font-bold'>Parking Details</p>
                            <Readmore text={car?.parkingDetails} />
                        </div>
                    )}

                    {/* Additional Guidelines Section */}
                    {car?.guideLines && (
                        <div className='space-y-3'>
                            <p className='font-bold'> Additional GuideLines</p>
                            <Readmore text={car.guideLines} />
                        </div>
                    )}

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
