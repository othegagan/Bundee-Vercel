'use client';

import ClientOnly from '@/components/ClientOnly';
import ErrorComponent from '@/components/custom/ErrorComponent';
import { VehiclesDetailsSkeleton } from '@/components/skeletons/skeletons';
import useDrivingLicenceDialog from '@/hooks/dialogHooks/useDrivingLicenceDialog';
import useLoginDialog from '@/hooks/dialogHooks/useLoginDialog';
import { useVehicleDetails } from '@/hooks/useVehicleDetails';
import { getFullAddress } from '@/lib/utils';
import { FaLocationDot } from 'react-icons/fa6';
import DynamicComponents from './_components/DynamicComponents';
import VehicleDetails from './_components/VehicleDetails';
import { WishlistButton } from './_components/WishlistButton';

interface Props {
    params: { id: string };
    searchParams: any;
}

export default function page({ params, searchParams }: Props) {
    const { data: vehicleDetailsResponse, isLoading: vehicleDetailsLoading, error: vehicleDetailsError } = useVehicleDetails(params.id);

    const loginModal = useLoginDialog();
    const drivingLicenceDialog = useDrivingLicenceDialog();

    if (vehicleDetailsLoading) {
        return (
            <div className='min-h-[100dvh] py-4'>
                <div className='mx-auto max-w-7xl flex-col '>
                    <VehiclesDetailsSkeleton />
                </div>
            </div>
        );
    }

    if (vehicleDetailsError) {
        return <ErrorComponent message={vehicleDetailsError?.message || ''} />;
    }

    if (!vehicleDetailsResponse.success) {
        return <ErrorComponent message={vehicleDetailsResponse.message || ''} />;
    }

    const vehicleDetails = vehicleDetailsResponse.data?.vehicleAllDetails?.[0];
    const vehicleHostDetails = vehicleDetailsResponse.data?.vehicleHostDetails[0] || null;
    const vehicleBusinessConstraints = vehicleDetailsResponse.data?.vehicleBusinessConstraints || null;

    return (
        <>
            <ClientOnly>
                <div className='py-4 pb-6 md:container'>
                    <div className='grid grid-cols-1 gap-6 md:gap-6 lg:grid-cols-3'>
                        <div className='flex flex-col items-start lg:col-span-2'>
                            <VehicleDetails
                                vehicleDetails={vehicleDetails}
                                vehicleHostDetails={vehicleHostDetails}
                                vehicleBusinessConstraints={vehicleBusinessConstraints}
                                wishlistButton={<WishlistButton vehicleId={vehicleDetails.id} variant='sm' />}
                            />
                        </div>

                        <div className='container  mt-4 flex flex-col gap-6 border-t border-neutral-200 pt-4 md:border-0 lg:row-span-3 lg:mt-0'>
                            <div className='flex justify-between'>
                                <h2 className='tracking-tight'>{`$${vehicleDetails?.price_per_hr} / day`}</h2>
                                <WishlistButton vehicleId={vehicleDetails.id} variant='lg' />
                            </div>

                            <div className='flex w-full flex-col gap-2'>
                                <div className='text-[15px] font-semibold'>Vehicle Location</div>
                                <p className='text-14 flex items-center rounded-md border px-3 py-2'>
                                    <FaLocationDot className='mr-2 size-5' />
                                    {getFullAddress({ vehicleDetails })}
                                </p>
                            </div>

                            <DynamicComponents
                                vehicleId={vehicleDetails.id}
                                vehicleDetails={vehicleDetails}
                                hostDetails={vehicleHostDetails}
                                bussinessConstraints={vehicleBusinessConstraints}
                            />
                        </div>
                    </div>
                </div>
            </ClientOnly>
        </>
    );
}
