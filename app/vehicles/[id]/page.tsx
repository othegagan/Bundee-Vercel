'use client';

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
        <main className='flex-grow py-6'>
            <div className='flex flex-col gap-8 md:container md:mx-auto md:px-4 lg:flex-row'>
                {/* Left scrollable content */}
                <div className='overflow-y-auto lg:w-2/3'>
                    <VehicleDetails
                        vehicleDetails={vehicleDetails}
                        vehicleHostDetails={vehicleHostDetails}
                        vehicleBusinessConstraints={vehicleBusinessConstraints}
                        wishlistButton={<WishlistButton vehicleId={vehicleDetails.id} variant='sm' />}
                    />
                </div>

                {/* Right sticky content */}
                <div className='lg:w-1/3'>
                    <div className='sticky top-20 space-y-6 px-4 md:px-0'>
                        <div className='flex items-center justify-between'>
                            <h2 className='font-bold text-2xl'>{`$${vehicleDetails?.price_per_hr} / day`}</h2>
                            <WishlistButton vehicleId={vehicleDetails.id} variant='lg' />
                        </div>

                        <div className='flex w-full flex-col gap-2'>
                            <div className='font-semibold text-[15px]'>Vehicle Location</div>
                            <p className='flex items-center rounded-md border px-3 py-2 text-14'>
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
        </main>
    );
}
